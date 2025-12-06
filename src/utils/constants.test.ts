import { describe, it, expect } from 'vitest';
import {
  SERVER_VERSION,
  DEFAULT_MAX_RESULTS,
  SCORE_TITLE_MATCH,
  SCORE_SECTION_MATCH,
  SCORE_MAX,
} from '../utils/constants.js';

describe('Constants', () => {
  it('should have valid server configuration', () => {
    expect(SERVER_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(typeof DEFAULT_MAX_RESULTS).toBe('number');
    expect(DEFAULT_MAX_RESULTS).toBeGreaterThan(0);
  });

  it('should have valid score weights', () => {
    expect(SCORE_TITLE_MATCH).toBeGreaterThan(0);
    expect(SCORE_SECTION_MATCH).toBeGreaterThan(0);
    expect(SCORE_TITLE_MATCH).toBeGreaterThan(SCORE_SECTION_MATCH);
    expect(SCORE_MAX).toBeGreaterThan(SCORE_TITLE_MATCH);
  });
});
