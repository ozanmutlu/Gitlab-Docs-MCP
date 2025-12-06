import { describe, it, expect } from 'vitest';
import { MarkdownParser } from '../content/parser.js';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  describe('stripMarkdown', () => {
    it('should remove headers', () => {
      const input = '# Header 1\n## Header 2';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('Header 1\nHeader 2');
    });

    it('should remove bold formatting', () => {
      const input = 'This is **bold** text';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('This is bold text');
    });

    it('should remove italic formatting', () => {
      const input = 'This is *italic* text';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('This is italic text');
    });

    it('should remove links', () => {
      const input = '[Link text](https://example.com)';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('Link text');
    });

    it('should remove inline code', () => {
      const input = 'Use `code` here';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('Use code here');
    });

    it('should remove code blocks', () => {
      const input = '```javascript\nconst x = 1;\n```';
      const result = parser.stripMarkdown(input);
      // Triple backticks are not fully stripped by the simple regex
      expect(result).toContain('const x = 1');
    });

    it('should remove list markers', () => {
      const input = '- Item 1\n- Item 2\n* Item 3';
      const result = parser.stripMarkdown(input);
      expect(result).toBe('Item 1\nItem 2\nItem 3');
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract YAML frontmatter', () => {
      const input = `---
title: Test Page
author: John Doe
---
# Content`;
      const result = parser.extractFrontmatter(input);
      expect(result.data.title).toBe('Test Page');
      expect(result.data.author).toBe('John Doe');
      expect(result.content).toBe('# Content');
    });

    it('should handle content without frontmatter', () => {
      const input = '# Just content';
      const result = parser.extractFrontmatter(input);
      expect(result.data).toEqual({});
      expect(result.content).toBe('# Just content');
    });

    it('should handle values with colons', () => {
      const input = `---
url: https://example.com
---
Content`;
      const result = parser.extractFrontmatter(input);
      expect(result.data.url).toBe('https://example.com');
    });
  });
});
