/**
 * AutonomousAgentEngine — ReAct Cognitive Reasoning Loop
 *
 * Implements an autonomous Thought -> Action -> Observation cycle.
 * Anticipates states, chains multi-step diagnostic tools, and executes
 * autonomous campus interventions without requiring user hand-holding.
 */

import { PulseEventBroker } from './broker';
import { AgentToolRegistry, type DispatchRemediationOutput } from './tools';
import type { AffectTensor } from '../pulse/affect';
import type { CausalAnalysis } from '../pulse/causal';
import type { PrescriptiveAction } from '../pulse/prescriptive';

export interface ReActStep {
  stepNumber: number;
  thought: string;
  action?: string;
  actionInput?: unknown;
  observation?: string;
}

export interface AgentExecutionReport {
  sessionId: string;
  triggerReason: string;
  steps: ReActStep[];
  finalResolution: string;
  remediation?: DispatchRemediationOutput;
  completedAt: number;
}

export class AutonomousAgentEngine {
  private static activeReports: AgentExecutionReport[] = [];

  /**
   * Runs the autonomous reasoning loop over incoming feedback comments.
   */
  static async executeReasoningCycle(comments: string[], triggerReason = 'Continuous Telemetry Scan'): Promise<AgentExecutionReport> {
    const sessionId = `react-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const steps: ReActStep[] = [];

    // Step 1: Cognitive Assessment
    const step1: ReActStep = {
      stepNumber: 1,
      thought: `Received feedback stream with ${comments.length} inputs. Initiating multi-dimensional affect evaluation.`,
      action: 'analyzeTensor',
      actionInput: { commentCount: comments.length },
    };
    const tensor: AffectTensor = await AgentToolRegistry.analyzeTensor.execute({ comments });
    step1.observation = `Valence: ${tensor.meanValence}, Friction Velocity: ${tensor.frictionVelocity}, Polarization: ${tensor.polarizationEntropy}.`;
    steps.push(step1);
    await PulseEventBroker.emit('agent:thought:generated', { sessionId, step: step1 });

    // Step 2: Causal Isolation
    const step2: ReActStep = {
      stepNumber: 2,
      thought: tensor.frictionVelocity > 0 || tensor.meanValence < 0
        ? `Negative friction detected (dF/dt = ${tensor.frictionVelocity}). Querying causal topology graph to isolate primary culprit.`
        : 'Feedback is stable. Mapping background systemic dependencies.',
      action: 'traceCausalDependencies',
    };
    const causal: CausalAnalysis = await AgentToolRegistry.traceCausalDependencies.execute({ comments });
    const rootLabel = causal.rootCauseNode?.label ?? 'None';
    step2.observation = `Root cause domain isolated: ${rootLabel} (Centrality: ${causal.rootCauseNode?.centrality ?? 0}). Ghost signals identified: ${causal.ghostSignals.length}.`;
    steps.push(step2);
    await PulseEventBroker.emit('agent:thought:generated', { sessionId, step: step2 });

    // Step 3: Prescriptive Synthesis
    const step3: ReActStep = {
      stepNumber: 3,
      thought: `Synthesizing highest-ROI prescriptive interventions targeting ${rootLabel}.`,
      action: 'generatePrescriptions',
    };
    const actions: PrescriptiveAction[] = await AgentToolRegistry.generatePrescriptions.execute({ causal });
    const topAction = actions[0];
    step3.observation = topAction
      ? `Selected top intervention: "${topAction.title}" (Projected Friction Reduction: ${topAction.projectedFrictionReduction}%, ROI: ${topAction.roiScore}/10).`
      : 'No critical interventions required.';
    steps.push(step3);
    await PulseEventBroker.emit('agent:thought:generated', { sessionId, step: step3 });

    // Step 4: Autonomous Remediation Dispatch
    let remediation: DispatchRemediationOutput | undefined;
    if (topAction && (tensor.frictionVelocity > 0 || tensor.meanValence < -0.1)) {
      const step4: ReActStep = {
        stepNumber: 4,
        thought: `Autonomous threshold exceeded. Dispatching remediation ticket for ${topAction.domain} without requiring human intervention.`,
        action: 'dispatchAutonomousRemediation',
        actionInput: { actionId: topAction.id, domain: topAction.domain },
      };
      remediation = await AgentToolRegistry.dispatchAutonomousRemediation.execute({
        actionId: topAction.id,
        targetDomain: topAction.domain,
        remediationPayload: topAction.description,
      });
      step4.observation = `Remediation successfully dispatched. Acknowledgment: ${remediation.acknowledgmentId}. Expected friction reduction: ${remediation.projectedFrictionReduction}%.`;
      steps.push(step4);
      await PulseEventBroker.emit('agent:action:dispatched', { sessionId, remediation });
    }

    const report: AgentExecutionReport = {
      sessionId,
      triggerReason,
      steps,
      finalResolution: topAction
        ? `Autonomous cycle complete: Remediated ${topAction.domain} via "${topAction.title}".`
        : 'Autonomous cycle complete: Campus environment in equilibrium.',
      remediation,
      completedAt: Date.now(),
    };

    if (this.activeReports.length > 50) {
      this.activeReports.shift();
    }
    this.activeReports.push(report);

    return report;
  }

  static getRecentReports(): AgentExecutionReport[] {
    return [...this.activeReports];
  }

  static clear(): void {
    this.activeReports = [];
  }
}
