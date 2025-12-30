import { describe, it, expect, beforeEach } from 'vitest';
import { PulseEventBroker } from './broker';
import { AgentToolRegistry } from './tools';
import { AutonomousAgentEngine } from './react';

describe('Agentic Autonomy & ReAct Reasoning Loop', () => {
  beforeEach(() => {
    PulseEventBroker.clear();
    AutonomousAgentEngine.clear();
  });

  describe('PulseEventBroker', () => {
    it('emits and delivers reactive events asynchronously', async () => {
      let received = false;
      const unsubscribe = PulseEventBroker.subscribe('pulse:anomaly:detected', (event) => {
        received = true;
        expect(event.payload).toEqual({ domain: 'wifi', severity: 'Critical' });
      });

      await PulseEventBroker.emit('pulse:anomaly:detected', { domain: 'wifi', severity: 'Critical' });
      expect(received).toBe(true);

      unsubscribe();
      received = false;
      await PulseEventBroker.emit('pulse:anomaly:detected', { domain: 'wifi', severity: 'Critical' });
      expect(received).toBe(false);
    });
  });

  describe('AgentToolRegistry', () => {
    it('executes tools with type-safe structured inputs', async () => {
      const comments = ['Wifi is completely broken in block B', 'Library is packed and loud'];
      const tensor = await AgentToolRegistry.analyzeTensor.execute({ comments });
      expect(tensor.sampleCount).toBe(2);

      const causal = await AgentToolRegistry.traceCausalDependencies.execute({ comments });
      expect(causal.nodes.length).toBeGreaterThan(0);

      const prescriptions = await AgentToolRegistry.generatePrescriptions.execute({ causal });
      expect(prescriptions.length).toBeGreaterThan(0);
    });
  });

  describe('AutonomousAgentEngine (ReAct Loop)', () => {
    it('executes multi-step reasoning cycle and autonomously dispatches remediation', async () => {
      const comments = [
        'Terrible Wi-Fi in the engineering hall, keeps disconnecting every 5 minutes!',
        'Because the Wi-Fi is broken, the library study desks are overcrowded.',
        'Awful network, cannot take my online quiz.',
      ];

      const report = await AutonomousAgentEngine.executeReasoningCycle(comments, 'Crisis Surge Test');

      expect(report.sessionId).toBeDefined();
      expect(report.steps.length).toBeGreaterThanOrEqual(3);
      expect(report.steps[0].thought).toContain('Initiating multi-dimensional affect evaluation');
      expect(report.steps[1].thought).toContain('Querying causal topology graph');
      expect(report.steps[2].thought).toContain('Synthesizing highest-ROI prescriptive interventions');

      // Step 4 autonomous remediation should have fired
      expect(report.remediation).toBeDefined();
      expect(report.remediation?.success).toBe(true);
      expect(report.finalResolution).toContain('Autonomous cycle complete');
    });
  });
});
