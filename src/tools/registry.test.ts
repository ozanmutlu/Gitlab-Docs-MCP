import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS, getToolDefinition, isValidToolName } from './registry.js';

describe('Tool Registry', () => {
  it('should have all tool definitions', () => {
    expect(TOOL_DEFINITIONS).toHaveLength(3);

    const toolNames = TOOL_DEFINITIONS.map((t) => t.name);
    expect(toolNames).toContain('searchGitLabDocs');
    expect(toolNames).toContain('getDocPage');
    expect(toolNames).toContain('listDocSections');
  });

  it('should get tool definition by name', () => {
    const searchTool = getToolDefinition('searchGitLabDocs');
    expect(searchTool).toBeDefined();
    expect(searchTool?.name).toBe('searchGitLabDocs');
    expect(searchTool?.description).toContain('Search GitLab documentation');

    const getPageTool = getToolDefinition('getDocPage');
    expect(getPageTool).toBeDefined();
    expect(getPageTool?.name).toBe('getDocPage');

    const listSectionsTool = getToolDefinition('listDocSections');
    expect(listSectionsTool).toBeDefined();
    expect(listSectionsTool?.name).toBe('listDocSections');
  });

  it('should return undefined for unknown tool', () => {
    const unknownTool = getToolDefinition('unknownTool');
    expect(unknownTool).toBeUndefined();
  });

  it('should validate tool names', () => {
    expect(isValidToolName('searchGitLabDocs')).toBe(true);
    expect(isValidToolName('getDocPage')).toBe(true);
    expect(isValidToolName('listDocSections')).toBe(true);
    expect(isValidToolName('unknownTool')).toBe(false);
  });

  it('should have valid input schemas', () => {
    const searchTool = getToolDefinition('searchGitLabDocs');
    expect(searchTool?.inputSchema).toBeDefined();
    expect(searchTool?.inputSchema.type).toBe('object');
    expect(searchTool?.inputSchema.properties).toBeDefined();
    expect(searchTool?.inputSchema.required).toContain('query');

    const getPageTool = getToolDefinition('getDocPage');
    expect(getPageTool?.inputSchema.required).toContain('path');

    const listSectionsTool = getToolDefinition('listDocSections');
    expect(listSectionsTool?.inputSchema.properties).toBeDefined();
  });
});
