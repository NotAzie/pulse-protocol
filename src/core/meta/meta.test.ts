import { describe, it, expect, beforeEach } from 'vitest';
import { RuntimeTelemetry } from './telemetry';
import { AdaptiveCache } from './cache';
import { SelfOptimizingKernel } from './optimizer';

describe('Meta-Architecture & Self-Optimization Kernel', () => {
  beforeEach(() => {
    SelfOptimizingKernel.reset();
  });

  describe('RuntimeTelemetry', () => {
    it('records microsecond latencies and computes statistics', () => {
      RuntimeTelemetry.recordLatency(2.5);
      RuntimeTelemetry.recordLatency(4.1);
      RuntimeTelemetry.recordLatency(1.8);

      const snapshot = RuntimeTelemetry.getSnapshot();
      expect(snapshot.averageLatencyMs).toBeGreaterThan(0);
      expect(snapshot.systemLoad).toBe('Nominal');
    });

    it('tracks cache hit ratio accurately', () => {
      RuntimeTelemetry.recordCacheAccess(true);
      RuntimeTelemetry.recordCacheAccess(true);
      RuntimeTelemetry.recordCacheAccess(false);

      const snapshot = RuntimeTelemetry.getSnapshot();
      expect(snapshot.cacheHitRatio).toBeCloseTo(0.667, 2);
    });
  });

  describe('AdaptiveCache', () => {
    it('stores and retrieves cached items with frequency scoring', () => {
      const cache = new AdaptiveCache<string, number>(10);
      cache.set('wifi-metric', 42);
      expect(cache.get('wifi-metric')).toBe(42);
      expect(cache.size).toBe(1);
    });

    it('adapts capacity dynamically under critical load', () => {
      const cache = new AdaptiveCache<string, string>(100, 10);
      for (let i = 0; i < 50; i++) {
        cache.set(`k-${i}`, `v-${i}`);
      }
      expect(cache.size).toBe(50);

      // Trigger critical load adaptation
      cache.adaptCapacity('Critical');
      expect(cache.capacity).toBe(50); // Halved from 100
      expect(cache.size).toBeLessThanOrEqual(50);
    });
  });

  describe('SelfOptimizingKernel & Self-Healing', () => {
    it('dynamically adapts execution strategy based on system pressure', () => {
      const status1 = SelfOptimizingKernel.evaluateAndAdapt();
      expect(status1.activeStrategy).toBe('BitwiseDirect');

      // Simulate heavy load
      for (let i = 0; i < 100; i++) {
        RuntimeTelemetry.recordLatency(65); // High latency
      }

      const status2 = SelfOptimizingKernel.evaluateAndAdapt();
      expect(status2.activeStrategy).toBe('StreamChunked');
      expect(status2.healedAnomaliesCount).toBeGreaterThan(0);
    });

    it('self-heals catastrophic errors gracefully without throwing', () => {
      const result = SelfOptimizingKernel.executeWithHealing(
        () => {
          throw new Error('Simulated memory fault');
        },
        (err) => {
          return `Recovered safely: ${err.message}`;
        }
      );

      expect(result).toContain('Recovered safely');
      const status = SelfOptimizingKernel.getStatus();
      expect(status.circuitBreakerTripped).toBe(true);
      expect(status.healedAnomaliesCount).toBe(1);
    });
  });
});
