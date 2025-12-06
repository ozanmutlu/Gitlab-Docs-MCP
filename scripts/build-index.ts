#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { MarkdownParser } from '../src/content/parser.js';
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

  // Process each file
  for (const filePath of mdFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const { data: frontmatter, content: markdown } = parser.extractFrontmatter(content);

      const relativePath = relative(REPO_PATH, filePath);
      const section = relativePath.split('/')[0];

      documents.push({
        id: relativePath,
        path: relativePath,
        title: (frontmatter.title as string) || extractTitle(markdown) || relativePath,
        section,
        content: parser.stripMarkdown(markdown),
        version: (frontmatter.version as string) || 'latest',
        lastUpdated: new Date(),
        metadata: frontmatter,
      });

      if (documents.length % 100 === 0) {
        console.log(`  Processed ${documents.length} documents...`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error);
    }
  }

  // Write documents
  const docsPath = join(OUTPUT_PATH, INDEX_DOCS_FILE);
  writeFileSync(docsPath, JSON.stringify(documents, null, 2));
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
