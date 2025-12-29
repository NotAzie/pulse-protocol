/**
 * RuntimeTelemetry — Dynamic Performance & Memory Observation Kernel
 *
 * Continuously measures microsecond execution latencies, memory footprint,
 * GC pressure, and throughput to feed the self-optimizing engine.
 */

export interface TelemetrySnapshot {
  timestamp: number;
  heapUsedBytes?: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  throughputItemsPerSec: number;
  cacheHitRatio: number;
  errorRate: number;
  systemLoad: 'Nominal' | 'Elevated' | 'Critical';
}

export class RuntimeTelemetry {
  private static latencies: number[] = [];
  private static totalOps = 0;
  private static totalErrors = 0;
  private static cacheHits = 0;
  private static cacheRequests = 0;
  private static startTime = Date.now();

  static recordLatency(ms: number): void {
    if (this.latencies.length > 500) {
      this.latencies.shift();
    }
    this.latencies.push(ms);
    this.totalOps++;
  }

  static recordCacheAccess(hit: boolean): void {
    this.cacheRequests++;
    if (hit) this.cacheHits++;
  }

  static recordError(): void {
    this.totalErrors++;
  }

  static getSnapshot(): TelemetrySnapshot {
    const latenciesSorted = [...this.latencies].sort((a, b) => a - b);
    const n = latenciesSorted.length;

    const avg = n > 0 ? latenciesSorted.reduce((a, b) => a + b, 0) / n : 0;
    const p95 = n > 0 ? latenciesSorted[Math.floor(n * 0.95)] : 0;

    const elapsedSec = Math.max(0.1, (Date.now() - this.startTime) / 1000);
    const throughput = Number((this.totalOps / elapsedSec).toFixed(1));
    const hitRatio = this.cacheRequests > 0 ? Number((this.cacheHits / this.cacheRequests).toFixed(3)) : 1.0;
    const errorRate = this.totalOps > 0 ? Number((this.totalErrors / this.totalOps).toFixed(4)) : 0;

    // Detect browser heap memory if available
    const perfMemory = typeof performance !== 'undefined' && (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    const heapUsed = perfMemory ? perfMemory.usedJSHeapSize : undefined;

    let systemLoad: TelemetrySnapshot['systemLoad'] = 'Nominal';
    if (p95 > 50 || (heapUsed && heapUsed > 100 * 1024 * 1024) || errorRate > 0.05) {
      systemLoad = 'Critical';
    } else if (p95 > 20 || (heapUsed && heapUsed > 50 * 1024 * 1024)) {
      systemLoad = 'Elevated';
    }

    return {
      timestamp: Date.now(),
      heapUsedBytes: heapUsed,
      averageLatencyMs: Number(avg.toFixed(2)),
      p95LatencyMs: Number(p95.toFixed(2)),
      throughputItemsPerSec: throughput,
      cacheHitRatio: hitRatio,
      errorRate,
      systemLoad,
    };
  }

  static reset(): void {
    this.latencies = [];
    this.totalOps = 0;
    this.totalErrors = 0;
    this.cacheHits = 0;
    this.cacheRequests = 0;
    this.startTime = Date.now();
  }
}
