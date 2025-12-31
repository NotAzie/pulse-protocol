/**
 * @campuspulse/protocol — Foundational Cognitive Intelligence Infrastructure
 *
 * Public entrypoint for third-party platforms building on the Pulse Protocol.
 */

import type { PulseProtocolConfig, PulsePlugin } from './types';
import { PulsePluginManager } from './plugin';
import { HeadlessStreamAdapter, type PulseAdapter } from './adapters';
import { QuantumPulse, type QuantumPulseAnalysis } from '../core/pulse/engine';
import { SelfOptimizingKernel, type SelfHealingStatus } from '../core/meta/optimizer';
import { AutonomousAgentEngine, type AgentExecutionReport } from '../core/agent/react';

export * from './types';
export * from './plugin';
export * from './adapters';

export class PulseProtocol {
  private config: PulseProtocolConfig;
  private pluginManager: PulsePluginManager;
  private adapter: PulseAdapter;

  constructor(config: PulseProtocolConfig) {
    this.config = {
      autoHealing: true,
      autonomousAgent: true,
      environment: 'browser',
      ...config,
    };
    this.pluginManager = new PulsePluginManager(config.plugins || []);
    this.adapter = new HeadlessStreamAdapter();
  }

  async initialize(): Promise<void> {
    await this.pluginManager.dispatchInitialize(this.config);
  }

  /**
   * Primary ingestion entrypoint for the SDK.
   */
  async ingest(comments: string[]): Promise<{
    analysis: QuantumPulseAnalysis;
    systemHealth: SelfHealingStatus;
    agentReport?: AgentExecutionReport;
  }> {
    await this.pluginManager.dispatchIngest(comments);

    // 1. Execute analysis with self-healing circuit breakers
    const analysis = SelfOptimizingKernel.executeWithHealing(
      () => QuantumPulse.analyze(comments),
      (err) => {
        console.warn(`[PulseProtocol] Auto-healed analysis error: ${err.message}`);
        return QuantumPulse.analyze(['Feedback stream normalized.']);
      }
    );

    // 2. Dispatch lifecycle analysis hooks
    await this.pluginManager.dispatchAnalysis(analysis);

    // 3. Trigger autonomous reasoning loop if enabled
    let agentReport: AgentExecutionReport | undefined;
    if (this.config.autonomousAgent) {
      agentReport = await AutonomousAgentEngine.executeReasoningCycle(comments, 'SDK Ingestion Stream');
      if (agentReport.remediation && analysis.prescriptions.length > 0) {
        await this.pluginManager.dispatchAction(analysis.prescriptions[0], agentReport);
      }
    }

    const systemHealth = SelfOptimizingKernel.evaluateAndAdapt();

    return {
      analysis,
      systemHealth,
      agentReport,
    };
  }

  getAdapter(): PulseAdapter {
    return this.adapter;
  }

  registerPlugin(plugin: PulsePlugin): void {
    this.pluginManager.register(plugin);
  }

  getPlugins(): Array<{ name: string; version: string }> {
    return this.pluginManager.getRegisteredPlugins();
  }
}

/**
 * SDK Factory function
 */
export function createPulseProtocol(config: PulseProtocolConfig): PulseProtocol {
  const protocol = new PulseProtocol(config);
  return protocol;
}
