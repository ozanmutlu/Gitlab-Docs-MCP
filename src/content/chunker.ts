/**
 * Document chunking utilities for splitting large documents into manageable pieces
 * Specifically handles the massive GraphQL reference documentation
 */

import { logger } from '../utils/logger.js';

interface ChunkConfig {
  /**
   * Maximum size in characters before chunking is applied
   */
  maxChunkSize: number;
  
  /**
   * Section markers that indicate logical split points
   */
  sectionMarkers: string[];
  
  /**
   * Overlap between chunks to preserve context
   */
  overlapSize: number;
}

interface DocumentChunk {
  /**
   * Original document path with chunk suffix
   */
  path: string;
  
  /**
   * Title of the chunk
   */
  title: string;
  
  /**
   * Content of the chunk
   */
  content: string;
  
  /**
   * Which chunk this is (1-indexed)
   */
  chunkIndex: number;
  
  /**
   * Total number of chunks for this document
   */
  totalChunks: number;
}

/**
 * Default configuration for GraphQL reference chunking
 * Note: These markers are based on GitLab's auto-generated GraphQL documentation structure.
 * If markers change, the system falls back to size-based chunking automatically.
 */
const GRAPHQL_CHUNK_CONFIG: ChunkConfig = {
  maxChunkSize: 500000, // 500KB per chunk
  sectionMarkers: [
    'Query type',
    'Mutation type', 
    'Object types',
    'Enumeration types',
    'Scalar types',
    'Abstract types',
    'Input types',
  ],
  overlapSize: 1000, // 1KB overlap to preserve context
};

/**
 * Checks if a document should be chunked based on size and path
 */
export function shouldChunkDocument(path: string, content: string): boolean {
  // Only chunk the massive GraphQL reference file
  if (path === 'api/graphql/reference/_index.md' && content.length > 500000) {
    return true;
  }
  return false;
}

/**
 * Splits a large document into logical chunks based on section markers
 */
export function chunkDocument(
  path: string,
  title: string,
  content: string,
  config: ChunkConfig = GRAPHQL_CHUNK_CONFIG
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  
  // Find all section markers
  const sections: { marker: string; position: number }[] = [];
  
  for (const marker of config.sectionMarkers) {
    const regex = new RegExp(`^${marker}\\s*$`, 'gm');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      sections.push({
        marker,
        position: match.index,
      });
    }
  }
  
  // Sort sections by position
  sections.sort((a, b) => a.position - b.position);
  
  if (sections.length === 0) {
    // No sections found, fall back to size-based chunking
    logger.warn(`No section markers found in ${path}, using size-based chunking`);
    return chunkBySize(path, title, content, config);
  }
  
  logger.info(`Found ${sections.length} sections in ${path}, creating semantic chunks`);
  
  // Create chunks based on sections
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const nextSection = sections[i + 1];
    
    const start = section.position;
    const end = nextSection ? nextSection.position : content.length;
    
    const chunkContent = content.slice(start, end);
    
    // If chunk is still too large, split it further
    if (chunkContent.length > config.maxChunkSize * 1.5) {
      const subChunks = chunkBySize(
        `${path}#${sanitizeMarker(section.marker)}`,
        `${title} - ${section.marker}`,
        chunkContent,
        config
      );
      chunks.push(...subChunks);
    } else {
      chunks.push({
        path: `${path}#${sanitizeMarker(section.marker)}`,
        title: `${title} - ${section.marker}`,
        content: chunkContent,
        chunkIndex: chunks.length + 1,
        totalChunks: 0, // Will be set later
      });
    }
  }
  
  // Update total chunks count
  const totalChunks = chunks.length;
  chunks.forEach((chunk) => {
    chunk.totalChunks = totalChunks;
  });
  
  return chunks;
}

/**
 * Splits content by size when no logical sections are found
 */
function chunkBySize(
  path: string,
  title: string,
  content: string,
  config: ChunkConfig
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let position = 0;
  let chunkIndex = 1;
  
  while (position < content.length) {
    const end = Math.min(position + config.maxChunkSize, content.length);
    let chunkEnd = end;
    
    // Try to break at a paragraph boundary
    if (end < content.length) {
      const nextNewlines = content.indexOf('\n\n', end - 100);
      if (nextNewlines !== -1 && nextNewlines < end + 100) {
        chunkEnd = nextNewlines;
      }
    }
    
    const chunkContent = content.slice(
      Math.max(0, position - config.overlapSize),
      chunkEnd
    );
    
    chunks.push({
      path: `${path}#chunk-${chunkIndex}`,
      title: `${title} (Part ${chunkIndex})`,
      content: chunkContent,
      chunkIndex,
      totalChunks: 0, // Will be set later
    });
    
    position = chunkEnd;
    chunkIndex++;
  }
  
  // Update total chunks count
  const totalChunks = chunks.length;
  chunks.forEach((chunk) => {
    chunk.totalChunks = totalChunks;
  });
  
  return chunks;
}

/**
 * Sanitizes a section marker for use in a path fragment
 */
function sanitizeMarker(marker: string): string {
  return marker
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Creates a summary chunk with links to all other chunks
 */
export function createSummaryChunk(
  originalPath: string,
  originalTitle: string,
  chunks: DocumentChunk[]
): string {
  const summaryLines = [
    `# ${originalTitle}`,
    '',
    '> **Note:** This document has been split into multiple sections for better performance.',
    '',
    '## Available Sections',
    '',
  ];
  
  for (const chunk of chunks) {
    summaryLines.push(`- [${chunk.title}](${chunk.path})`);
  }
  
  summaryLines.push('');
  summaryLines.push('## About This Reference');
  summaryLines.push('');
  summaryLines.push('This is the auto-generated GraphQL API reference for GitLab. Each section contains detailed information about:');
  summaryLines.push('');
  summaryLines.push('- **Query types**: Top-level entry points for read operations');
  summaryLines.push('- **Mutation types**: Entry points for write operations');
  summaryLines.push('- **Object types**: Resource representations in the API');
  summaryLines.push('- **Enumeration types**: Predefined value sets');
  summaryLines.push('- **Scalar types**: Basic data types');
  summaryLines.push('- **Abstract types**: Unions and interfaces');
  summaryLines.push('- **Input types**: Arguments for mutations and queries');
  summaryLines.push('');
  summaryLines.push('Use the interactive GraphQL explorer to test queries, or generate a machine-readable schema in IDL or JSON formats.');
  
  return summaryLines.join('\n');
}
