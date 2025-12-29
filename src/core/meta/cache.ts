/**
 * AdaptiveCache<K, V>
 *
 * Hybrid LFU-LRU cache with dynamic capacity resizing.
 * Automatically sheds entries and shrinks allocation when high memory
 * pressure or GC latency is detected by the telemetry kernel.
 */

import { RuntimeTelemetry } from './telemetry';

interface CacheEntry<V> {
  value: V;
  frequency: number;
  lastAccessed: number;
}

export class AdaptiveCache<K, V> {
  private store = new Map<K, CacheEntry<V>>();
  private maxCapacity: number;
  private currentCapacity: number;
  private minCapacity: number;

  constructor(initialCapacity = 2000, minCapacity = 250) {
    this.maxCapacity = initialCapacity;
    this.currentCapacity = initialCapacity;
    this.minCapacity = minCapacity;
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      RuntimeTelemetry.recordCacheAccess(false);
      return undefined;
    }

    entry.frequency++;
    entry.lastAccessed = Date.now();
    RuntimeTelemetry.recordCacheAccess(true);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.store.size >= this.currentCapacity) {
      this.evict();
    }

    this.store.set(key, {
      value,
      frequency: 1,
      lastAccessed: Date.now(),
    });
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  /**
   * Intelligently shrinks or expands capacity based on telemetry load.
   */
  adaptCapacity(load: 'Nominal' | 'Elevated' | 'Critical'): void {
    if (load === 'Critical') {
      this.currentCapacity = Math.max(this.minCapacity, Math.floor(this.currentCapacity * 0.5));
      while (this.store.size > this.currentCapacity) {
        this.evict();
      }
    } else if (load === 'Nominal' && this.currentCapacity < this.maxCapacity) {
      this.currentCapacity = Math.min(this.maxCapacity, Math.floor(this.currentCapacity * 1.25));
    }
  }

  private evict(): void {
    let victimKey: K | null = null;
    let minScore = Infinity;

    // Score = frequency * 0.4 + (1 / age) * 0.6
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      const ageSec = Math.max(0.1, (now - entry.lastAccessed) / 1000);
      const score = entry.frequency * 0.4 + (1 / ageSec) * 0.6;
      if (score < minScore) {
        minScore = score;
        victimKey = key;
      }
    }

    if (victimKey !== null) {
      this.store.delete(victimKey);
    }
  }

  get size(): number {
    return this.store.size;
  }

  get capacity(): number {
    return this.currentCapacity;
  }

  clear(): void {
    this.store.clear();
  }
}
