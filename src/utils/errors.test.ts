import { describe, it, expect } from 'vitest';
import {
  GitLabDocsError,
  IndexNotFoundError,
  DocumentNotFoundError,
  InvalidSearchQueryError,
  IndexLoadError,
  ToolExecutionError,
} from '../utils/errors.js';

describe('Custom Errors', () => {
  describe('GitLabDocsError', () => {
    it('should create error with message', () => {
      const error = new GitLabDocsError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('GitLabDocsError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('IndexNotFoundError', () => {
    it('should format error message with path', () => {
      const error = new IndexNotFoundError('/test/path');
      expect(error.message).toContain('/test/path');
      expect(error.message).toContain('npm run build-index');
      expect(error.name).toBe('IndexNotFoundError');
    });
  });

  describe('DocumentNotFoundError', () => {
    it('should format error message with document path', () => {
      const error = new DocumentNotFoundError('ci/README.md');
      expect(error.message).toBe('Document not found: ci/README.md');
      expect(error.name).toBe('DocumentNotFoundError');
    });
  });

  describe('InvalidSearchQueryError', () => {
    it('should format error message with reason', () => {
      const error = new InvalidSearchQueryError('query too short');
      expect(error.message).toBe('Invalid search query: query too short');
      expect(error.name).toBe('InvalidSearchQueryError');
    });
  });

  describe('IndexLoadError', () => {
    it('should create error with message', () => {
      const error = new IndexLoadError('Failed to parse JSON');
      expect(error.message).toContain('Failed to load index');
      expect(error.message).toContain('Failed to parse JSON');
      expect(error.name).toBe('IndexLoadError');
    });

    it('should include cause stack trace', () => {
      const cause = new Error('Original error');
      const error = new IndexLoadError('Failed', cause);
      expect(error.stack).toContain('Caused by:');
    });
  });

  describe('ToolExecutionError', () => {
    it('should format error message with tool name', () => {
      const error = new ToolExecutionError('searchGitLabDocs', 'Invalid arguments');
      expect(error.message).toBe("Tool 'searchGitLabDocs' execution failed: Invalid arguments");
      expect(error.name).toBe('ToolExecutionError');
    });
  });
});
