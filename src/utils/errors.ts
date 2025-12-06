/**
 * Custom error types for better error handling
 */

export class GitLabDocsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitLabDocsError';
  }
}

export class IndexNotFoundError extends GitLabDocsError {
  constructor(indexPath: string) {
    super(`Index not found at ${indexPath}. Run 'npm run build-index' to create it.`);
    this.name = 'IndexNotFoundError';
  }
}

export class DocumentNotFoundError extends GitLabDocsError {
  constructor(path: string) {
    super(`Document not found: ${path}`);
    this.name = 'DocumentNotFoundError';
  }
}

export class InvalidSearchQueryError extends GitLabDocsError {
  constructor(reason: string) {
    super(`Invalid search query: ${reason}`);
    this.name = 'InvalidSearchQueryError';
  }
}

export class IndexLoadError extends GitLabDocsError {
  constructor(message: string, cause?: Error) {
    super(`Failed to load index: ${message}`);
    this.name = 'IndexLoadError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

export class ToolExecutionError extends GitLabDocsError {
  constructor(toolName: string, message: string) {
    super(`Tool '${toolName}' execution failed: ${message}`);
    this.name = 'ToolExecutionError';
  }
}
