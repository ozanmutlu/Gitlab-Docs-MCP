import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { SearchResult, Document as DocType } from '../types/models.js';
import { logger } from '../utils/logger.js';
import { IndexNotFoundError, IndexLoadError } from '../utils/errors.js';
import { FlexSearchIndex } from './flexsearch-wrapper.js';
import { performanceMonitor } from '../utils/performance.js';
import {
  FLEXSEARCH_TOKENIZE,
  FLEXSEARCH_RESOLUTION,
  FLEXSEARCH_MIN_LENGTH,
  FLEXSEARCH_CACHE_SIZE,
  SCORE_TITLE_MATCH,
  SCORE_SECTION_MATCH,
  SCORE_CONTENT_MATCH,
  SCORE_MAX_CONTENT,
  SCORE_MAX,
  DEFAULT_EXCERPT_LENGTH,
  EXCERPT_CONTEXT_BEFORE,
  EXCERPT_CONTEXT_AFTER,
  INDEX_META_FILE,
  INDEX_DOCS_FILE,
} from '../utils/constants.js';

/**
 * Full-text search engine using Flexsearch
 * Provides fast in-memory search across GitLab documentation
 */
export class SearchEngine {
  private index: FlexSearchIndex;
  private documents: Map<string, DocType>;
  private indexPath: string;

  /**
   * Creates a new search engine instance
   * @param indexPath - Path to the search index directory
   */
  constructor(indexPath: string) {
    this.indexPath = indexPath;
    this.documents = new Map();

    // Initialize Flexsearch index with type-safe wrapper
    this.index = new FlexSearchIndex({
      tokenize: FLEXSEARCH_TOKENIZE,
      resolution: FLEXSEARCH_RESOLUTION,
      minlength: FLEXSEARCH_MIN_LENGTH,
      cache: FLEXSEARCH_CACHE_SIZE,
    });
  }

  /**
   * Loads the search index from disk
   * Reads documents and adds them to the Flexsearch index
   * @throws {IndexNotFoundError} If index files are missing
   * @throws {IndexLoadError} If index data cannot be parsed
   */
  loadIndex(): void {
    return performanceMonitor.measureSync('index-load', () => {
      const metaPath = join(this.indexPath, INDEX_META_FILE);
      const docsPath = join(this.indexPath, INDEX_DOCS_FILE);

      if (!existsSync(metaPath) || !existsSync(docsPath)) {
        throw new IndexNotFoundError(this.indexPath);
      }

      try {
        // Load documents
        const docsData = JSON.parse(readFileSync(docsPath, 'utf-8')) as unknown[];
        for (const doc of docsData) {
          const typedDoc = doc as DocType & { lastUpdated: string | Date };
          // Convert lastUpdated string to Date
          if (typeof typedDoc.lastUpdated === 'string') {
            typedDoc.lastUpdated = new Date(typedDoc.lastUpdated);
          }
          this.documents.set(typedDoc.id, typedDoc as DocType);
          this.index.add({
            id: typedDoc.id,
            title: typedDoc.title,
            section: typedDoc.section,
            content: typedDoc.content,
            path: typedDoc.path,
          });
        }

        logger.info(`Loaded ${this.documents.size} documents`);
      } catch (error) {
        throw new IndexLoadError(
          'Failed to parse index data',
          error instanceof Error ? error : undefined
        );
      }
    }, { documentCount: this.documents.size });
  }

  /**
   * Performs full-text search across documents
   * @param query - Search query string
   * @param maxResults - Maximum number of results to return (default: 10)
   * @param section - Optional section filter
   * @param minScore - Minimum score threshold for results (default: 0.0)
   * @returns Search results with total count
   */
  search(
    query: string,
    maxResults: number = 10,
    section?: string,
    minScore: number = 0.0
  ): { results: SearchResult[]; total: number } {
    return performanceMonitor.measureSync('search', () => {
      // Perform search using type-safe wrapper
      const searchResults = this.index.search(query);

      // Flatten results (Flexsearch returns results per field)
      const docIds = new Set<string>();
      for (const fieldResults of searchResults) {
        if (Array.isArray(fieldResults.result)) {
          for (const item of fieldResults.result) {
            // FlexSearch returns string IDs directly, not objects
            const id = typeof item === 'string' ? item : item.id;
            docIds.add(id);
          }
        }
      }

      // Convert to SearchResult format
      const results: SearchResult[] = [];
      for (const id of docIds) {
        const doc = this.documents.get(id);
        if (!doc) {
          continue;
        }

        // Filter by section if specified
        if (section && doc.section !== section) {
          continue;
        }

        // Calculate score (simplified - based on query matches)
        const score = this.calculateScore(query, doc);
        if (score < minScore) {
          continue;
        }

        results.push({
          title: doc.title,
          path: doc.path,
          url: `https://docs.gitlab.com/${doc.path}`,
          excerpt: this.generateExcerpt(query, doc.content),
        score,
      });

      if (results.length >= maxResults) {
        break;
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    return {
      results: results.slice(0, maxResults),
      total: docIds.size,
    };
    }, { query, maxResults, section, minScore });
  }

  private calculateScore(query: string, doc: DocType): number {
    const queryLower = query.toLowerCase();
    const titleLower = doc.title.toLowerCase();
    const sectionLower = doc.section.toLowerCase();
    const contentLower = doc.content.toLowerCase();
    let score = 0;

    // Split query into words for better matching
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);

    // Title matches (highest weight)
    for (const word of queryWords) {
      if (titleLower.includes(word)) {
        score += SCORE_TITLE_MATCH;
        // Bonus for exact title match
        if (titleLower === queryLower) {
          score += SCORE_TITLE_MATCH;
        }
      }
    }

    // Section matches
    for (const word of queryWords) {
      if (sectionLower.includes(word)) {
        score += SCORE_SECTION_MATCH;
      }
    }

    // Content match (word frequency)
    for (const word of queryWords) {
      if (word.length >= 3) { // Skip very short words
        const regex = new RegExp(word, 'gi');
        const matches = (contentLower.match(regex) || []).length;
        score += Math.min(matches * SCORE_CONTENT_MATCH, SCORE_MAX_CONTENT / queryWords.length);
      }
    }

    // Path match bonus (e.g., ci/pipelines for "pipeline" query)
    const pathLower = doc.path.toLowerCase();
    for (const word of queryWords) {
      if (pathLower.includes(word)) {
        score += 0.5;
      }
    }

    return Math.min(score, SCORE_MAX);
  }

  private generateExcerpt(
    query: string,
    content: string,
    maxLength: number = DEFAULT_EXCERPT_LENGTH
  ): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const index = contentLower.indexOf(queryLower);

    if (index === -1) {
      return content.substring(0, maxLength) + '...';
    }

    // Extract context around match
    const start = Math.max(0, index - EXCERPT_CONTEXT_BEFORE);
    const end = Math.min(content.length, index + query.length + EXCERPT_CONTEXT_AFTER);

    let excerpt = content.substring(start, end);
    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < content.length) {
      excerpt += '...';
    }

    return excerpt;
  }

  isReady(): boolean {
    return this.documents.size > 0;
  }

  getDocumentCount(): number {
    return this.documents.size;
  }

  getDocument(id: string): DocType | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): DocType[] {
    return Array.from(this.documents.values());
  }
}
