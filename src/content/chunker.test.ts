import { describe, it, expect } from 'vitest';
import { shouldChunkDocument, chunkDocument, createSummaryChunk } from './chunker.js';

describe('Document Chunker', () => {
  describe('shouldChunkDocument', () => {
    it('should return true for large GraphQL reference', () => {
      const largePath = 'api/graphql/reference/_index.md';
      const largeContent = 'x'.repeat(600000); // 600KB
      
      expect(shouldChunkDocument(largePath, largeContent)).toBe(true);
    });

    it('should return false for small GraphQL reference', () => {
      const path = 'api/graphql/reference/_index.md';
      const smallContent = 'x'.repeat(100000); // 100KB
      
      expect(shouldChunkDocument(path, smallContent)).toBe(false);
    });

    it('should return false for other large documents', () => {
      const path = 'some/other/doc.md';
      const largeContent = 'x'.repeat(600000);
      
      expect(shouldChunkDocument(path, largeContent)).toBe(false);
    });
  });

  describe('chunkDocument', () => {
    it('should split document by section markers', () => {
      const content = `Query type
Some query content here.
This is about queries.

Mutation type
Some mutation content here.
This is about mutations.

Object types
Object types represent resources.
More object type info.`;

      const chunks = chunkDocument(
        'api/graphql/reference/_index.md',
        'GraphQL Reference',
        content
      );

      expect(chunks.length).toBe(3);
      expect(chunks[0].title).toBe('GraphQL Reference - Query type');
      expect(chunks[0].path).toBe('api/graphql/reference/_index.md#query-type');
      expect(chunks[1].title).toBe('GraphQL Reference - Mutation type');
      expect(chunks[2].title).toBe('GraphQL Reference - Object types');
      
      // Check that each chunk has correct metadata
      chunks.forEach((chunk) => {
        expect(chunk.totalChunks).toBe(3);
      });
    });

    it('should handle content without section markers', () => {
      const content = 'x'.repeat(600000);
      
      const chunks = chunkDocument(
        'some/doc.md',
        'Some Document',
        content
      );

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0].title).toContain('(Part 1)');
      expect(chunks[1].title).toContain('(Part 2)');
    });

    it('should include chunk metadata', () => {
      const content = `Query type
Content here.

Mutation type
More content.`;

      const chunks = chunkDocument(
        'api/graphql/reference/_index.md',
        'GraphQL Reference',
        content
      );

      expect(chunks[0].chunkIndex).toBe(1);
      expect(chunks[1].chunkIndex).toBe(2);
      expect(chunks[0].totalChunks).toBe(2);
      expect(chunks[1].totalChunks).toBe(2);
    });
  });

  describe('createSummaryChunk', () => {
    it('should create a summary with links to all chunks', () => {
      const chunks = [
        {
          path: 'api/graphql/reference/_index.md#query-type',
          title: 'GraphQL Reference - Query type',
          content: 'content',
          chunkIndex: 1,
          totalChunks: 2,
        },
        {
          path: 'api/graphql/reference/_index.md#mutation-type',
          title: 'GraphQL Reference - Mutation type',
          content: 'content',
          chunkIndex: 2,
          totalChunks: 2,
        },
      ];

      const summary = createSummaryChunk(
        'api/graphql/reference/_index.md',
        'GraphQL Reference',
        chunks
      );

      expect(summary).toContain('# GraphQL Reference');
      expect(summary).toContain('split into multiple sections');
      expect(summary).toContain('[GraphQL Reference - Query type](api/graphql/reference/_index.md#query-type)');
      expect(summary).toContain('[GraphQL Reference - Mutation type](api/graphql/reference/_index.md#mutation-type)');
      expect(summary).toContain('About This Reference');
    });
  });
});
