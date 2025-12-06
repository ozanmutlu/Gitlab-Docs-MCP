import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';

/**
 * Markdown parser using remark for GitLab documentation
 * Handles GitHub Flavored Markdown and frontmatter extraction
 */
export class MarkdownParser {
  private processor;

  constructor() {
    this.processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, {
      bullet: '-',
      emphasis: '*',
      strong: '*',
      listItemIndent: 'one',
    });
  }

  /**
   * Parses markdown content using remark
   * @param content - Raw markdown content
   * @returns Processed markdown string
   */
  async parse(content: string): Promise<string> {
    const file = await this.processor.process(content);
    return String(file);
  }

  /**
   * Strips markdown formatting for search indexing
   * Removes headers, bold, italic, links, code blocks, and list markers
   * @param content - Markdown content to strip
   * @returns Plain text without markdown formatting
   */
  stripMarkdown(content: string): string {
    // Remove markdown syntax for search indexing
    return content
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
      .replace(/\*(.+?)\*/g, '$1') // Italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
      .replace(/`{1,3}(.+?)`{1,3}/g, '$1') // Code
      .replace(/^\s*[-*+]\s/gm, '') // Lists
      .trim();
  }

  /**
   * Extracts YAML frontmatter from markdown content
   * Parses simple key: value pairs from frontmatter block
   * @param content - Markdown content with optional frontmatter
   * @returns Object containing frontmatter data and remaining content
   */
  extractFrontmatter(content: string): { data: Record<string, unknown>; content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { data: {}, content };
    }

    const frontmatter = match[1];
    const data: Record<string, unknown> = {};

    // Simple YAML parsing (key: value)
    for (const line of frontmatter.split('\n')) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        data[key.trim()] = valueParts.join(':').trim();
      }
    }

    return {
      data,
      content: content.replace(frontmatterRegex, ''),
    };
  }
}
