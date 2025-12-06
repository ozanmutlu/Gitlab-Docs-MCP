import { describe, it, expect } from 'vitest';
import { ContentCache } from '../content/cache.js';

describe('ContentCache', () => {
  it('should store and retrieve values', () => {
    const cache = new ContentCache({
      maxSizeMB: 1,
      maxEntries: 10,
      ttlMinutes: 5,
    });

    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    const cache = new ContentCache({
      maxSizeMB: 1,
      maxEntries: 10,
      ttlMinutes: 5,
    });

    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('should check key existence', () => {
    const cache = new ContentCache({
      maxSizeMB: 1,
      maxEntries: 10,
      ttlMinutes: 5,
    });

    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('should clear all entries', () => {
    const cache = new ContentCache({
      maxSizeMB: 1,
      maxEntries: 10,
      ttlMinutes: 5,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.has('key1')).toBe(false);
  });

  it('should respect max entries limit', () => {
    const cache = new ContentCache({
      maxSizeMB: 1,
      maxEntries: 2,
      ttlMinutes: 5,
    });

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3'); // Should evict key1

    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(true);
    expect(cache.has('key3')).toBe(true);
  });
});
