import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DEFAULT_MAX_RESULTS } from '../utils/constants.js';

export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'searchGitLabDocs',
    description:
      'Search GitLab documentation for CI/CD pipelines, runners, API, administration, deployment, security, container registry, Kubernetes integration, and all GitLab features. Covers 2,900+ pages including tutorials, configuration guides, troubleshooting, and best practices.',
    annotations: {
      title: 'Search GitLab Documentation',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum results to return (default: 10)',
          default: DEFAULT_MAX_RESULTS,
        },
        section: {
          type: 'string',
          description: 'Filter by documentation section (optional)',
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          description: 'Array of search results with title, path, url, excerpt, and score',
        },
        total: {
          type: 'object',
          description: 'Total number of matching documents',
        },
      },
    },
  },
  {
    name: 'getDocPage',
    description:
      'Get the complete content of any GitLab documentation page including detailed configuration examples, code snippets, and step-by-step guides for GitLab features',
    annotations: {
      title: 'Get Documentation Page',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Document path (e.g., "ci/yaml/_index.md")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'listDocSections',
    description:
      'Browse GitLab documentation structure including sections for CI/CD, API, administration, user guides, development, security, operations, and integrations',
    annotations: {
      title: 'List Documentation Sections',
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export function getToolDefinition(name: string): Tool | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

export function isValidToolName(name: string): boolean {
  return TOOL_DEFINITIONS.some((tool) => tool.name === name);
}
