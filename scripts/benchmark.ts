/**
 * CampusPulse Standalone Performance Benchmark Suite
 */

import { QuantumPulse } from '../src/core/pulse/engine';
import { SelfOptimizingKernel } from '../src/core/meta/optimizer';
import { RuntimeTelemetry } from '../src/core/meta/telemetry';

export function runBenchmark(iterations = 1000): void {
  const sampleComments = [
    'The campus Wi-Fi in the main engineering library is broken and slow.',
    'Dining hall food was fresh and reasonable today.',
    'Classroom air conditioning is freezing and noisy.',
    'Advisor support queue is disorganized and taking hours.',
    'The workshop presentation was clear and extremely helpful.',
  ];

  const dataset: string[] = [];
  for (let i = 0; i < iterations; i++) {
    dataset.push(sampleComments[i % sampleComments.length]);
  }

  const start = performance.now();
  const result = QuantumPulse.analyze(dataset);
  const duration = performance.now() - start;

  const snapshot = RuntimeTelemetry.getSnapshot();
  const health = SelfOptimizingKernel.evaluateAndAdapt();

  console.log(`[Benchmark] Ingested ${dataset.length} items in ${duration.toFixed(2)}ms`);
  console.log(`[Benchmark] Throughput: ${(dataset.length / (duration / 1000)).toFixed(0)} items/sec`);
  console.log(`[Benchmark] Active Strategy: ${health.activeStrategy}`);
  console.log(`[Benchmark] Mean Valence: ${result.tensor.meanValence}`);
  console.log(`[Benchmark] P95 Latency: ${snapshot.p95LatencyMs}ms`);
}

if (typeof process !== 'undefined' && process.argv[1]?.includes('benchmark')) {
  runBenchmark(5000);
}
