/**
 * PulsePluginManager — Dynamic Plugin Registry & Lifecycle Dispatcher
 */

import type { PulsePlugin, PulseProtocolConfig } from './types';
import type { QuantumPulseAnalysis } from '../core/pulse/engine';
import type { GhostSignal } from '../core/pulse/causal';
import type { PrescriptiveAction } from '../core/pulse/prescriptive';
import type { AgentExecutionReport } from '../core/agent/react';

export class PulsePluginManager {
  private plugins: PulsePlugin[] = [];

  constructor(plugins: PulsePlugin[] = []) {
    this.plugins = [...plugins];
  }

  register(plugin: PulsePlugin): void {
    if (!this.plugins.some((p) => p.name === plugin.name)) {
      this.plugins.push(plugin);
    }
  }

  async dispatchInitialize(config: PulseProtocolConfig): Promise<void> {
    for (const p of this.plugins) {
      if (p.onInitialize) await Promise.resolve(p.onInitialize(config));
    }
  }

  async dispatchIngest(comments: string[]): Promise<void> {
    for (const p of this.plugins) {
      if (p.onIngest) await Promise.resolve(p.onIngest(comments));
    }
  }

  async dispatchAnalysis(analysis: QuantumPulseAnalysis): Promise<void> {
    for (const p of this.plugins) {
      if (p.onAnalysisComplete) await Promise.resolve(p.onAnalysisComplete(analysis));
      if (p.onGhostSignalDetected && analysis.causal.ghostSignals.length > 0) {
        await Promise.resolve(p.onGhostSignalDetected(analysis.causal.ghostSignals));
      }
    }
  }

  async dispatchAction(action: PrescriptiveAction, report: AgentExecutionReport): Promise<void> {
    for (const p of this.plugins) {
      if (p.onAgentActionDispatched) await Promise.resolve(p.onAgentActionDispatched(action, report));
    }
  }

  getRegisteredPlugins(): Array<{ name: string; version: string }> {
    return this.plugins.map((p) => ({ name: p.name, version: p.version }));
  }
}

/**
 * Built-in Enterprise Incident Webhook Plugin (Sample Protocol Integration)
 */
export function createWebhookNotifierPlugin(options: { webhookUrl: string }): PulsePlugin {
  return {
    name: 'enterprise-webhook-notifier',
    version: '1.0.0',
    onGhostSignalDetected: (signals: GhostSignal[]) => {
      console.log(`[PulseProtocol:Webhook] Dispatched ${signals.length} ghost signals to ${options.webhookUrl}`);
    },
  };
}
