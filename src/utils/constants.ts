/**
 * Application constants
 */

// Server configuration
export const SERVER_VERSION = '1.0.0';
export const SERVER_NAME = 'gitlab-docs-mcp';

// Search configuration
export const DEFAULT_MAX_RESULTS = 10;
export const MAX_ALLOWED_RESULTS = 50;
export const MIN_SEARCH_SCORE = 0.0;
export const DEFAULT_EXCERPT_LENGTH = 200;
export const EXCERPT_CONTEXT_BEFORE = 50;
export const EXCERPT_CONTEXT_AFTER = 150;

// Scoring weights
export const SCORE_TITLE_MATCH = 3.0;
export const SCORE_SECTION_MATCH = 1.5;
export const SCORE_CONTENT_MATCH = 0.5;
export const SCORE_MAX_CONTENT = 5.0;
export const SCORE_MAX = 10.0;

// Cache configuration defaults
export const DEFAULT_CACHE_SIZE_MB = 50;
export const DEFAULT_CACHE_ENTRIES = 100;
export const DEFAULT_CACHE_TTL_MINUTES = 60;

// Index configuration
export const INDEX_VERSION = '1.0.0';
export const GITLAB_DOCS_URL = 'https://docs.gitlab.com/';
export const GITLAB_DOCS_REPO = 'https://gitlab.com/gitlab-org/gitlab-docs';

// File paths
export const DEFAULT_INDEX_PATH = 'data/gitlab-docs';
export const INDEX_META_FILE = 'index_meta.json';
export const INDEX_DOCS_FILE = 'documents.json';
export const DOCS_REPO_PATH = 'data/gitlab-docs-repo/doc';

// Flexsearch configuration
export const FLEXSEARCH_TOKENIZE = 'forward';
export const FLEXSEARCH_RESOLUTION = 9;
export const FLEXSEARCH_MIN_LENGTH = 2;
export const FLEXSEARCH_CACHE_SIZE = 100;
