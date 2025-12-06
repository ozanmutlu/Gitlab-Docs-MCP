import { z } from 'zod';

// Zod schemas for runtime validation
export const DocumentSchema = z.object({
  id: z.string(),
  path: z.string(),
  title: z.string(),
  section: z.string(),
  content: z.string(),
  version: z.string(),
  lastUpdated: z.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const SearchResultSchema = z.object({
  title: z.string(),
  path: z.string(),
  url: z.string(),
  excerpt: z.string(),
  score: z.number(),
});

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number(),
});

export const DocPageResponseSchema = z.object({
  title: z.string(),
  path: z.string(),
  url: z.string(),
  content: z.string(),
  metadata: z.record(z.string(), z.unknown()),
});

export const DocSectionSchema = z.object({
  name: z.string(),
  path: z.string(),
  pageCount: z.number(),
  subsections: z.array(z.string()).optional(),
});

export const ListSectionsResponseSchema = z.object({
  sections: z.array(DocSectionSchema),
  total: z.number(),
});

// TypeScript types inferred from Zod schemas
export type Document = z.infer<typeof DocumentSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type DocPageResponse = z.infer<typeof DocPageResponseSchema>;
export type DocSection = z.infer<typeof DocSectionSchema>;
export type ListSectionsResponse = z.infer<typeof ListSectionsResponseSchema>;
