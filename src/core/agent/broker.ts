/**
 * PulseEventBroker — Event-Driven Reactive Message Bus
 *
 * Decouples system events from static request-response paths, enabling
 * continuous background cognitive perception and agentic autonomy.
 */

export type PulseEventType =
  | 'pulse:stream:comment'
  | 'pulse:anomaly:detected'
  | 'pulse:friction:accelerated'
  | 'agent:thought:generated'
  | 'agent:action:dispatched';

export interface PulseEvent<T = unknown> {
  id: string;
  type: PulseEventType;
  timestamp: number;
  payload: T;
}

export type EventHandler<T> = (event: PulseEvent<T>) => void | Promise<void>;

export class PulseEventBroker {
  private static subscribers = new Map<PulseEventType, Set<EventHandler<unknown>>>();
  private static eventLog: PulseEvent[] = [];

  static subscribe<T>(type: PulseEventType, handler: EventHandler<T>): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    const handlers = this.subscribers.get(type)!;
    handlers.add(handler as EventHandler<unknown>);

    return () => {
      handlers.delete(handler as EventHandler<unknown>);
    };
  }

  static async emit<T>(type: PulseEventType, payload: T): Promise<PulseEvent<T>> {
    const event: PulseEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      timestamp: Date.now(),
      payload,
    };

    if (this.eventLog.length > 200) {
      this.eventLog.shift();
    }
    this.eventLog.push(event as PulseEvent<unknown>);

    const handlers = this.subscribers.get(type);
    if (handlers) {
      const promises = Array.from(handlers).map((fn) => {
        try {
          return Promise.resolve(fn(event as PulseEvent<unknown>));
        } catch (err) {
          console.error(`Error in event handler for ${type}:`, err);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }

    return event;
  }

  static getHistory(): PulseEvent[] {
    return [...this.eventLog];
  }

  static clear(): void {
    this.subscribers.clear();
    this.eventLog = [];
  }
}
