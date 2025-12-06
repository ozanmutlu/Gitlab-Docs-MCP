/**
 * Simple performance monitoring utilities
 */

export interface PerformanceMetrics {
  operation: string;
  durationMs: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Measure the execution time of an async operation
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = performance.now() - start;

      this.recordMetric({
        operation,
        durationMs,
        timestamp: new Date(),
        metadata,
      });

      return result;
    } catch (error) {
      const durationMs = performance.now() - start;
      this.recordMetric({
        operation,
        durationMs,
        timestamp: new Date(),
        metadata: { ...metadata, error: true },
      });
      throw error;
    }
  }

  /**
   * Measure synchronous operation
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const durationMs = performance.now() - start;

      this.recordMetric({
        operation,
        durationMs,
        timestamp: new Date(),
        metadata,
      });

      return result;
    } catch (error) {
      const durationMs = performance.now() - start;
      this.recordMetric({
        operation,
        durationMs,
        timestamp: new Date(),
        metadata: { ...metadata, error: true },
      });
      throw error;
    }
  }

  /**
   * Record a metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsFor(operation: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.operation === operation);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string): number {
    const metrics = this.getMetricsFor(operation);
    if (metrics.length === 0) {
      return 0;
    }

    const sum = metrics.reduce((acc, m) => acc + m.durationMs, 0);
    return sum / metrics.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get summary statistics
   */
  getSummary(): Record<string, { count: number; avgMs: number; minMs: number; maxMs: number }> {
    const summary: Record<string, { count: number; avgMs: number; minMs: number; maxMs: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.operation]) {
        summary[metric.operation] = {
          count: 0,
          avgMs: 0,
          minMs: Infinity,
          maxMs: -Infinity,
        };
      }

      const stats = summary[metric.operation];
      stats.count++;
      stats.minMs = Math.min(stats.minMs, metric.durationMs);
      stats.maxMs = Math.max(stats.maxMs, metric.durationMs);
    }

    // Calculate averages
    for (const operation in summary) {
      const metrics = this.getMetricsFor(operation);
      const sum = metrics.reduce((acc, m) => acc + m.durationMs, 0);
      summary[operation].avgMs = sum / metrics.length;
    }

    return summary;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
