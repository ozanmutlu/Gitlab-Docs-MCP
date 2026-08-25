#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { MarkdownParser } from '../src/content/parser.js';
import { shouldChunkDocument, chunkDocument, createSummaryChunk } from '../src/content/chunker.js';
import type { Document } from '../src/types/models.js';
import {
  DOCS_REPO_PATH,
  DEFAULT_INDEX_PATH,
  INDEX_VERSION,
  GITLAB_DOCS_REPO,
  INDEX_META_FILE,
  INDEX_DOCS_FILE,
} from '../src/utils/constants.js';

const REPO_PATH = join(process.cwd(), DOCS_REPO_PATH);
const OUTPUT_PATH = join(process.cwd(), DEFAULT_INDEX_PATH);

interface IndexMeta {
  version: string;
  document_count: number;
  created_at: string;
  source_repo: string;
}

function buildIndex() {
  console.log('🔨 Building GitLab Docs search index...');
  console.log(`📂 Source: ${REPO_PATH}`);
  console.log(`📦 Output: ${OUTPUT_PATH}`);

  if (!existsSync(REPO_PATH)) {
    console.error(`❌ Source path not found: ${REPO_PATH}`);
    console.error('Please clone the GitLab docs repository to data/gitlab-docs-repo');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!existsSync(OUTPUT_PATH)) {
    mkdirSync(OUTPUT_PATH, { recursive: true });
  }

  const parser = new MarkdownParser();
  const documents: Document[] = [];

  // Recursively find all .md files
  function walkDir(dir: string): string[] {
    const files: string[] = [];
    for (const file of readdirSync(dir)) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (file.endsWith('.md')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  const mdFiles = walkDir(REPO_PATH);
  console.log(`📄 Found ${mdFiles.length} markdown files`);

  let chunkedDocCount = 0;
  let totalChunksCreated = 0;

  // Process each file
  for (const filePath of mdFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: markdown } = parser.extractFrontmatter(content);

      const relativePath = relative(REPO_PATH, filePath);
      const section = relativePath.split('/')[0];
      const docTitle = (frontmatter.title as string) || extractTitle(markdown) || relativePath;
      const strippedContent = parser.stripMarkdown(markdown);

      // Check if document should be chunked
      if (shouldChunkDocument(relativePath, strippedContent)) {
        console.log(`  📊 Chunking large document: ${relativePath} (${strippedContent.length.toLocaleString()} chars)`);
        
        const chunks = chunkDocument(relativePath, docTitle, strippedContent);
        
        // Create a summary document pointing to all chunks
        const summaryContent = createSummaryChunk(relativePath, docTitle, chunks);
        documents.push({
          id: relativePath,
          path: relativePath,
          title: docTitle,
          section,
          content: summaryContent,
          version: (frontmatter.version as string) || 'latest',
          lastUpdated: new Date(),
          metadata: {
            ...frontmatter,
            chunked: true,
            totalChunks: chunks.length,
          },
        });

        // Add each chunk as a separate document
        for (const chunk of chunks) {
          documents.push({
            id: chunk.path,
            path: chunk.path,
            title: chunk.title,
            section,
            content: chunk.content,
            version: (frontmatter.version as string) || 'latest',
            lastUpdated: new Date(),
            metadata: {
              ...frontmatter,
              isChunk: true,
              chunkIndex: chunk.chunkIndex,
              totalChunks: chunk.totalChunks,
              originalPath: relativePath,
            },
          });
        }
        
        chunkedDocCount++;
        totalChunksCreated += chunks.length;
        console.log(`    ✂️  Created ${chunks.length} chunks`);
      } else {
        // Normal document processing
        documents.push({
          id: relativePath,
          path: relativePath,
          title: docTitle,
          section,
          content: strippedContent,
          version: (frontmatter.version as string) || 'latest',
          lastUpdated: new Date(),
          metadata: frontmatter,
        });
      }

      if (documents.length % 100 === 0) {
        console.log(`  Processed ${documents.length} documents...`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error);
    }
  }

  // Write documents (compact JSON to minimize git storage)
  const docsPath = join(OUTPUT_PATH, INDEX_DOCS_FILE);
  writeFileSync(docsPath, JSON.stringify(documents));
  console.log(`✅ Wrote ${documents.length} documents to ${docsPath}`);

  // Write metadata
  const meta: IndexMeta = {
    version: INDEX_VERSION,
    document_count: documents.length,
    created_at: new Date().toISOString(),
    source_repo: GITLAB_DOCS_REPO,
  };

  const metaPath = join(OUTPUT_PATH, INDEX_META_FILE);
  writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`✅ Wrote metadata to ${metaPath}`);

  console.log('🎉 Index build complete!');
  console.log(`📊 Total documents: ${documents.length}`);
  console.log(`📊 Total sections: ${new Set(documents.map((d) => d.section)).size}`);
  console.log(`📊 Chunked documents: ${chunkedDocCount}`);
  console.log(`📊 Total chunks created: ${totalChunksCreated}`);
}

function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

try {
  buildIndex();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
