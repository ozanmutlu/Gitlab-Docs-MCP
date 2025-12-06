import { z } from 'zod';
import type { SearchEngine } from '../search/engine.js';
import type { DocumentTree } from '../search/document.js';
import type { MarkdownParser } from '../content/parser.js';
import type { ContentCache } from '../content/cache.js';
import type { Config } from '../config.js';
import { SearchResponseSchema } from '../types/models.js';
import { DEFAULT_MAX_RESULTS, MAX_ALLOWED_RESULTS } from '../utils/constants.js';

export interface ToolContext {
  searchEngine: SearchEngine;
  docTree: DocumentTree;
  parser: MarkdownParser;
  cache: ContentCache;
  config: Config;
}

const SearchArgsSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().int().min(1).max(MAX_ALLOWED_RESULTS).default(DEFAULT_MAX_RESULTS),
  section: z.string().optional(),
});

export function searchGitLabDocsTool(args: unknown, context: ToolContext) {
  // Validate arguments
  const { query, maxResults, section } = SearchArgsSchema.parse(args);

  // Perform search
  const { results, total } = context.searchEngine.search(
    query,
    maxResults,
    section,
    context.config.search.minScore
  );

  // Validate response
  const response = SearchResponseSchema.parse({ results, total });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
