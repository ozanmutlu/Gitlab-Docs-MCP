import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DEFAULT_MAX_RESULTS } from '../utils/constants.js';

/**
 * MCP Tool registry - single source of truth for tool definitions
 */
export const TOOL_DEFINITIONS: Tool[] = [
  {
    name: 'searchGitLabDocs',
    description: 'Search GitLab documentation for CI/CD pipelines, runners, API, administration, deployment, security, container registry, Kubernetes integration, and all GitLab features. Covers 2,494 pages including tutorials, configuration guides, troubleshooting, and best practices.',
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
  },
  {
    name: 'getDocPage',
    description: 'Get the complete content of any GitLab documentation page including detailed configuration examples, code snippets, and step-by-step guides for GitLab features',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Document path (e.g., "ci/README.md")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'listDocSections',
    description: 'Browse GitLab documentation structure including sections for CI/CD, API, administration, user guides, development, security, operations, and integrations',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Get tool definition by name
 */
export function getToolDefinition(name: string): Tool | undefined {
  return TOOL_DEFINITIONS.find((tool) => tool.name === name);
}

/**
 * Validate tool name exists
 */
export function isValidToolName(name: string): boolean {
  return TOOL_DEFINITIONS.some((tool) => tool.name === name);
}
