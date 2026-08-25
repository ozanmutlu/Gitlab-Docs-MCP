import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SearchEngine } from '../search/engine.js';
import type { DocumentTree } from '../search/document.js';
import type { MarkdownParser } from '../content/parser.js';

export interface ResourceContext {
  searchEngine: SearchEngine;
  docTree: DocumentTree;
  parser: MarkdownParser;
}

export function registerResources(server: McpServer, ctx: ResourceContext): void {
  server.registerResource(
    'sections',
    'gitlab-docs://sections',
    {
      title: 'GitLab Documentation Sections',
      description: 'Browsable list of all GitLab documentation sections and their page counts',
      mimeType: 'application/json',
    },
    () => ({
      contents: [
        {
          uri: 'gitlab-docs://sections',
          mimeType: 'application/json',
          text: JSON.stringify(ctx.docTree.getAllSections(), null, 2),
        },
      ],
    })
  );

  server.registerResource(
    'doc-page',
    new ResourceTemplate('gitlab-docs://pages/{path}', {
      list: () => ({
        resources: ctx.searchEngine.getAllDocuments().slice(0, 100).map((doc) => ({
          uri: `gitlab-docs://pages/${doc.path}`,
          name: doc.title,
          description: `Section: ${doc.section}`,
          mimeType: 'text/markdown',
        })),
      }),
      complete: {
        path: (value: string) => {
          const docs = ctx.searchEngine.getAllDocuments();
          return docs
            .filter((d) => d.path.startsWith(value))
            .slice(0, 20)
            .map((d) => d.path);
        },
      },
    }),
    {
      title: 'GitLab Documentation Page',
      description: 'Full content of a specific GitLab documentation page',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const path = variables.path as string;
      const doc = ctx.searchEngine.getDocument(path);

      if (!doc) {
        throw new Error(`Document not found: ${path}`);
      }

      const content = await ctx.parser.parse(doc.content);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: content,
          },
        ],
      };
    }
  );
}
