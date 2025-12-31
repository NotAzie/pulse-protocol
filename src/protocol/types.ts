/**
 * @campuspulse/protocol — Core Protocol Interfaces & Specifications
 *
 * Defines the open cognitive intelligence protocol that turns CampusPulse
 * into foundational infrastructure for third-party developers and enterprise platforms.
 */

import type { QuantumPulseAnalysis } from '../core/pulse/engine';
import type { GhostSignal } from '../core/pulse/causal';
import type { PrescriptiveAction } from '../core/pulse/prescriptive';
import type { AgentExecutionReport } from '../core/agent/react';

export interface PulseProtocolConfig {
  appId: string;
  environment?: 'browser' | 'node' | 'edge';
  autoHealing?: boolean;
  autonomousAgent?: boolean;
  plugins?: PulsePlugin[];
}

export interface PulsePlugin {
  name: string;
  version: string;
  onInitialize?: (config: PulseProtocolConfig) => void | Promise<void>;
  onIngest?: (comments: string[]) => void | Promise<void>;
  onAnalysisComplete?: (analysis: QuantumPulseAnalysis) => void | Promise<void>;
  onGhostSignalDetected?: (signals: GhostSignal[]) => void | Promise<void>;
  onAgentActionDispatched?: (action: PrescriptiveAction, report: AgentExecutionReport) => void | Promise<void>;
}

export interface PulseStreamMessage {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}
