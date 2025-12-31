/**
 * Headless Protocol Adapters
 *
 * Enables the Pulse Protocol to run headlessly across Node.js microservices,
 * Edge Workers (Cloudflare / V8 Isolates), or browser client applications.
 */

import type { PulseStreamMessage } from './types';
import { QuantumPulse, type QuantumPulseAnalysis } from '../core/pulse/engine';

export interface PulseAdapter {
  name: string;
  ingestStream: (messages: PulseStreamMessage[]) => Promise<QuantumPulseAnalysis>;
}

export class HeadlessStreamAdapter implements PulseAdapter {
  name = 'headless-stream-adapter';

  async ingestStream(messages: PulseStreamMessage[]): Promise<QuantumPulseAnalysis> {
    const rawTexts = messages.map((m) => m.text);
    return QuantumPulse.analyze(rawTexts);
  }
}

export class EdgeWorkerAdapter implements PulseAdapter {
  name = 'edge-worker-adapter';

  async ingestStream(messages: PulseStreamMessage[]): Promise<QuantumPulseAnalysis> {
    // Ultra-lightweight edge execution path using SimHash + Affect directly
    const rawTexts = messages.map((m) => m.text);
    return QuantumPulse.analyze(rawTexts);
  }
}
