import { describe, it, expect } from 'vitest';
import { performanceMonitor } from './performance.js';

describe('PerformanceMonitor', () => {
  it('should measure async operations', async () => {
    const result = await performanceMonitor.measure('test-async', async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return 'success';
    });

    expect(result).toBe('success');

    const metrics = performanceMonitor.getMetricsFor('test-async');
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics[0].operation).toBe('test-async');
    expect(metrics[0].durationMs).toBeGreaterThan(0);
  });

  it('should measure sync operations', () => {
    const result = performanceMonitor.measureSync('test-sync', () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    });

    expect(result).toBe(499500);

    const metrics = performanceMonitor.getMetricsFor('test-sync');
    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics[0].operation).toBe('test-sync');
  });

  it('should calculate average duration', async () => {
    performanceMonitor.clear();

    await performanceMonitor.measure('avg-test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });

    await performanceMonitor.measure('avg-test', async () => {
      await new Promise((resolve) => setTimeout(resolve, 15));
    });

    const avgDuration = performanceMonitor.getAverageDuration('avg-test');
    expect(avgDuration).toBeGreaterThan(0);
  });

  it('should track metadata', () => {
    performanceMonitor.clear();

    performanceMonitor.measureSync(
      'metadata-test',
      () => {
        return 'result';
      },
      { userId: 'test-user', operation: 'search' }
    );

    const metrics = performanceMonitor.getMetricsFor('metadata-test');
    expect(metrics[0].metadata).toEqual({ userId: 'test-user', operation: 'search' });
  });

  it('should handle errors and track them', async () => {
    performanceMonitor.clear();

    await expect(
      performanceMonitor.measure('error-test', () => {
        throw new Error('Test error');
      })
    ).rejects.toThrow('Test error');

    const metrics = performanceMonitor.getMetricsFor('error-test');
    expect(metrics[0].metadata?.error).toBe(true);
  });

  it('should generate summary statistics', async () => {
    performanceMonitor.clear();

    await performanceMonitor.measure('summary-test', async () => {});
    await performanceMonitor.measure('summary-test', async () => {});
    await performanceMonitor.measure('other-test', async () => {});

    const summary = performanceMonitor.getSummary();

    expect(summary['summary-test']).toBeDefined();
    expect(summary['summary-test'].count).toBe(2);
    expect(summary['summary-test'].avgMs).toBeGreaterThanOrEqual(0);
    expect(summary['summary-test'].minMs).toBeGreaterThanOrEqual(0);
    expect(summary['summary-test'].maxMs).toBeGreaterThanOrEqual(0);

    expect(summary['other-test']).toBeDefined();
    expect(summary['other-test'].count).toBe(1);
  });

  it('should clear all metrics', () => {
    performanceMonitor.clear();

    const metrics = performanceMonitor.getAllMetrics();
    expect(metrics.length).toBe(0);
  });
});
