import type { ToolContext } from './searchGitLabDocs.js';
import { ListSectionsResponseSchema } from '../types/models.js';

export function listDocSectionsTool(args: unknown, context: ToolContext) {
  const sections = context.docTree.getAllSections();

  const response = ListSectionsResponseSchema.parse({
    sections,
    total: sections.length,
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}
