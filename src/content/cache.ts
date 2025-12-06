import { LRUCache } from 'lru-cache';

/**
 * Options for configuring the content cache
 */
export interface CacheOptions {
  /** Maximum cache size in megabytes */
  maxSizeMB: number;
  /** Maximum number of cache entries */
  maxEntries: number;
  /** Time-to-live for cache entries in minutes */
  ttlMinutes: number;
}

/**
 * LRU cache for storing parsed document content
 * Reduces repeated parsing and improves response times
 */
export class ContentCache {
  private cache: LRUCache<string, string>;

  /**
   * Creates a new content cache with the specified options
   * @param options - Cache configuration options
   */
  constructor(options: CacheOptions) {
    this.cache = new LRUCache({
      max: options.maxEntries,
      maxSize: options.maxSizeMB * 1024 * 1024,
      sizeCalculation: (value) => value.length,
      ttl: options.ttlMinutes * 60 * 1000,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    });
  }

  /**
   * Retrieves a cached value by key
   * @param key - Cache key
   * @returns Cached value or undefined if not found/expired
   */
  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * Stores a value in the cache
   * @param key - Cache key
   * @param value - Value to cache
   */
  set(key: string, value: string): void {
    this.cache.set(key, value);
  }

  /**
   * Checks if a key exists in the cache
   * @param key - Cache key to check
   * @returns True if key exists and hasn't expired
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns the current number of entries in the cache
   * @returns Number of cached entries
   */
  size(): number {
    return this.cache.size;
  }
}
