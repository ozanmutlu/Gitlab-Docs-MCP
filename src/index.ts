#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { SearchEngine } from './search/engine.js';
import { DocumentTree } from './search/document.js';
import { MarkdownParser } from './content/parser.js';
import { ContentCache } from './content/cache.js';
import { loadConfig } from './config.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { logger } from './utils/logger.js';
import { SERVER_VERSION, SERVER_NAME, DEFAULT_MAX_RESULTS, MAX_ALLOWED_RESULTS } from './utils/constants.js';
import { SearchResponseSchema, DocPageResponseSchema, ListSectionsResponseSchema } from './types/models.js';
import { DocumentNotFoundError } from './utils/errors.js';

async function main() {
  try {
    const config = loadConfig();

    const searchEngine = new SearchEngine(config.indexPath);
    searchEngine.loadIndex();

    const docTree = new DocumentTree();
    docTree.buildFromEngine(searchEngine);

    const parser = new MarkdownParser();
    const cache = new ContentCache({
      maxSizeMB: config.cache.maxSizeMB,
      maxEntries: config.cache.maxEntries,
      ttlMinutes: config.cache.ttlMinutes,
    });

    logger.info(`✅ Loaded ${searchEngine.getDocumentCount()} documents`);
    logger.info(`📚 Built document tree: ${docTree.getSectionCount()} sections`);

    const server = new McpServer({
      name: SERVER_NAME,
      version: SERVER_VERSION,
    });

    // Register tools
    server.registerTool(
      'searchGitLabDocs',
      {
        title: 'Search GitLab Documentation',
        description:
          'Search GitLab documentation for CI/CD pipelines, runners, API, administration, deployment, security, container registry, Kubernetes integration, and all GitLab features.',
        inputSchema: {
          query: z.string().min(1),
          maxResults: z.number().int().min(1).max(MAX_ALLOWED_RESULTS).default(DEFAULT_MAX_RESULTS),
          section: z.string().optional(),
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      ({ query, maxResults, section }) => {
        const { results, total } = searchEngine.search(query, maxResults, section, config.search.minScore);
        const response = SearchResponseSchema.parse({ results, total });
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      }
    );

    server.registerTool(
      'getDocPage',
      {
        title: 'Get Documentation Page',
        description:
          'Get the complete content of any GitLab documentation page including configuration examples, code snippets, and step-by-step guides.',
        inputSchema: {
          path: z.string(),
        },
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      async ({ path }) => {
        const cacheKey = `doc:${path}`;
        const cached = cache.get(cacheKey);
        if (cached) {
          return { content: [{ type: 'text', text: cached }] };
        }

        const doc = searchEngine.getDocument(path);
        if (!doc) {
          throw new DocumentNotFoundError(path);
        }

        const parsedContent = await parser.parse(doc.content);
        const response = DocPageResponseSchema.parse({
          title: doc.title,
          path: doc.path,
          url: `https://docs.gitlab.com/${doc.path}`,
          content: parsedContent,
          metadata: doc.metadata || {},
        });

        const responseText = JSON.stringify(response, null, 2);
        cache.set(cacheKey, responseText);
        return { content: [{ type: 'text', text: responseText }] };
      }
    );

    server.registerTool(
      'listDocSections',
      {
        title: 'List Documentation Sections',
        description:
          'Browse GitLab documentation structure including sections for CI/CD, API, administration, user guides, development, security, operations, and integrations.',
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false,
        },
      },
      () => {
        const sections = docTree.getAllSections();
        const response = ListSectionsResponseSchema.parse({ sections, total: sections.length });
        return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
      }
    );

    // Register resources
    registerResources(server, { searchEngine, docTree, parser });

    // Register prompts
    registerPrompts(server);

    logger.info(`🚀 GitLab Docs MCP Server v${SERVER_VERSION}`);
    logger.info(`🔍 Index: ${config.indexPath}`);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('✓ Server initialized successfully');
  } catch (error) {
    logger.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

void main();
