import { z } from 'zod';
import type { ToolContext } from './searchGitLabDocs.js';
import { DocPageResponseSchema } from '../types/models.js';
import { DocumentNotFoundError } from '../utils/errors.js';

const GetDocPageArgsSchema = z.object({
  path: z.string(),
});

export async function getDocPageTool(args: unknown, context: ToolContext) {
  const { path } = GetDocPageArgsSchema.parse(args);

  // Check cache
  const cacheKey = `doc:${path}`;
  const cached = context.cache.get(cacheKey);
  if (cached) {
    return {
      content: [
        {
          type: 'text' as const,
          text: cached,
        },
      ],
    };
  }

  // Find document
  const doc = context.searchEngine.getAllDocuments().find((d) => d.path === path);

  if (!doc) {
    throw new DocumentNotFoundError(path);
  }

  // Parse markdown
  const parsedContent = await context.parser.parse(doc.content);

  const response = DocPageResponseSchema.parse({
    title: doc.title,
    path: doc.path,
    url: `https://docs.gitlab.com/${doc.path}`,
    content: parsedContent,
    metadata: doc.metadata || {},
  });

  // Cache result
  const responseText = JSON.stringify(response, null, 2);
  context.cache.set(cacheKey, responseText);

  return {
    content: [
      {
        type: 'text' as const,
        text: responseText,
      },
    ],
  };
}
