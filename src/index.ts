#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SearchEngine } from './search/engine.js';
import { DocumentTree } from './search/document.js';
import { MarkdownParser } from './content/parser.js';
import { ContentCache } from './content/cache.js';
import { loadConfig } from './config.js';
import {
  searchGitLabDocsTool,
  getDocPageTool,
  listDocSectionsTool,
  type ToolContext,
} from './tools/index.js';
import { TOOL_DEFINITIONS } from './tools/registry.js';
import { logger } from './utils/logger.js';
import { SERVER_VERSION, SERVER_NAME } from './utils/constants.js';

async function main() {
  try {
    // Load configuration
    const config = loadConfig();

    // Initialize components
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

    const context: ToolContext = {
      searchEngine,
      docTree,
      parser,
      cache,
      config,
    };

    logger.info(`✅ Loaded ${searchEngine.getDocumentCount()} documents`);
    logger.info(`📚 Built document tree: ${docTree.getSectionCount()} sections`);

    // Create MCP server
    const server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Register list_tools handler
    server.setRequestHandler(ListToolsRequestSchema, () => ({
      tools: TOOL_DEFINITIONS,
    }));

    // Register call_tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'searchGitLabDocs':
            return searchGitLabDocsTool(args, context);
          case 'getDocPage':
            return await getDocPageTool(args, context);
          case 'listDocSections':
            return listDocSectionsTool(args, context);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });

    logger.info(`🚀 GitLab Docs MCP Server v${SERVER_VERSION}`);
    logger.info(`🔍 Index: ${config.indexPath}`);

    // Connect via stdio
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('✓ Server initialized successfully');
  } catch (error) {
    logger.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

void main();
