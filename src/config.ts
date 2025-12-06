import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { IndexNotFoundError } from './utils/errors.js';
import {
  DEFAULT_INDEX_PATH,
  INDEX_META_FILE,
  DEFAULT_CACHE_SIZE_MB,
  DEFAULT_CACHE_ENTRIES,
  DEFAULT_CACHE_TTL_MINUTES,
  MIN_SEARCH_SCORE,
} from './utils/constants.js';

dotenvConfig();

// Get the directory where this module is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

/**
 * Configuration schema with validation
 */
const ConfigSchema = z.object({
  indexPath: z.string().min(1),
  search: z.object({
    minScore: z.number().min(0).max(10),
  }),
  cache: z.object({
    maxSizeMB: z.number().int().positive(),
    maxEntries: z.number().int().positive(),
    ttlMinutes: z.number().int().positive(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 * @throws {IndexNotFoundError} If index path doesn't exist
 * @throws {z.ZodError} If configuration is invalid
 */
export function loadConfig(): Config {
  // Determine index path - use PROJECT_ROOT instead of process.cwd()
  const indexPath = process.env.GITLAB_DOCS_INDEX_PATH || join(PROJECT_ROOT, DEFAULT_INDEX_PATH);

  // Verify index exists
  const metaPath = join(indexPath, INDEX_META_FILE);
  if (!existsSync(metaPath)) {
    throw new IndexNotFoundError(indexPath);
  }

  // Parse and validate configuration
  const config = ConfigSchema.parse({
    indexPath,
    search: {
      minScore: parseFloat(process.env.GITLAB_DOCS_MIN_SCORE || String(MIN_SEARCH_SCORE)),
    },
    cache: {
      maxSizeMB: parseInt(process.env.GITLAB_DOCS_CACHE_SIZE_MB || String(DEFAULT_CACHE_SIZE_MB), 10),
      maxEntries: parseInt(process.env.GITLAB_DOCS_CACHE_ENTRIES || String(DEFAULT_CACHE_ENTRIES), 10),
      ttlMinutes: parseInt(
        process.env.GITLAB_DOCS_CACHE_TTL_MIN || String(DEFAULT_CACHE_TTL_MINUTES),
        10
      ),
    },
  });

  return config;
}
