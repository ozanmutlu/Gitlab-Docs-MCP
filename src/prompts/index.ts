import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    'search-gitlab-docs',
    {
      title: 'Search GitLab Documentation',
      description: 'Search the official GitLab documentation for a specific topic',
      argsSchema: {
        query: z.string().describe('What to search for in GitLab docs'),
      },
    },
    ({ query }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Search GitLab documentation for: ${query}\n\nPlease use the searchGitLabDocs tool to find relevant documentation, then summarize the key information with links to the full pages.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'explain-gitlab-feature',
    {
      title: 'Explain GitLab Feature',
      description: 'Get a detailed explanation of a GitLab feature with examples',
      argsSchema: {
        feature: z.string().describe('The GitLab feature to explain (e.g., "merge request approvals", "CI/CD variables")'),
      },
    },
    ({ feature }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Explain how "${feature}" works in GitLab.\n\nSearch the GitLab documentation to provide:\n1. What it is and when to use it\n2. How to configure it\n3. Key options and best practices\n4. Common pitfalls to avoid`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    'troubleshoot-ci-pipeline',
    {
      title: 'Troubleshoot CI/CD Pipeline',
      description: 'Get help debugging a GitLab CI/CD pipeline issue',
      argsSchema: {
        error: z.string().describe('The error message or description of the CI/CD issue'),
      },
    },
    ({ error }) => ({
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I'm having a GitLab CI/CD pipeline issue:\n\n${error}\n\nPlease search the GitLab documentation for relevant troubleshooting guides, configuration references, and known solutions. Provide step-by-step debugging instructions.`,
          },
        },
      ],
    })
  );
}
