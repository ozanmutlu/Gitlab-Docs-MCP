import FlexSearch from 'flexsearch';

/**
 * Type-safe wrapper for FlexSearch Document index
 * Eliminates the need for @ts-ignore and any type assertions
 */
export interface FlexSearchConfig {
  tokenize: string;
  resolution: number;
  minlength: number;
  cache: number | boolean;
}

interface IndexDocument {
  id: string;
  title: string;
  section: string;
  content: string;
  path: string;
}

interface SearchField {
  field: string;
  result: Array<{
    id: string;
    title?: string;
    section?: string;
    path?: string;
  }>;
}

/**
 * Type-safe FlexSearch document index wrapper
 */
export class FlexSearchIndex {
  // Keep internal index as private with controlled type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private index: any;

  constructor(config: FlexSearchConfig) {
    // Single controlled type assertion point
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    this.index = new (FlexSearch as any).Document({
      document: {
        id: 'id',
        index: ['title:3', 'section:2', 'content'],
        store: ['title', 'section', 'path'],
      },
      tokenize: config.tokenize,
      resolution: config.resolution,
      minlength: config.minlength,
      optimize: true,
      cache: config.cache,
    });
  }

  /**
   * Add a document to the index
   */
  add(doc: IndexDocument): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.index.add(doc);
  }

  /**
   * Search the index with type-safe results
   */
  search(query: string): SearchField[] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const results = this.index.search(query) as SearchField[];
    return results;
  }

  /**
   * Remove a document from the index
   */
  remove(id: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.index.remove(id);
  }

  /**
   * Update a document in the index
   */
  update(doc: IndexDocument): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.index.update(doc);
  }
}
