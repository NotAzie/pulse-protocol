import { useEffect, useState } from 'react';
import { SelfOptimizingKernel, type SelfHealingStatus } from '../core/meta/optimizer';
import { RuntimeTelemetry, type TelemetrySnapshot } from '../core/meta/telemetry';
import { AutonomousAgentEngine, type AgentExecutionReport } from '../core/agent/react';
import { ShieldCheck, Bot, Cpu, CheckCircle2 } from 'lucide-react';

interface SingularityHUDProps {
  comments: string[];
}

export function SingularityHUD({ comments }: SingularityHUDProps) {
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>(() => RuntimeTelemetry.getSnapshot());
  const [kernelStatus, setKernelStatus] = useState<SelfHealingStatus>(() => SelfOptimizingKernel.getStatus());
  const [agentReport, setAgentReport] = useState<AgentExecutionReport | null>(null);
  const [isRunningAgent, setIsRunningAgent] = useState(false);

  // Poll telemetry and kernel adaptation
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(RuntimeTelemetry.getSnapshot());
      setKernelStatus(SelfOptimizingKernel.evaluateAndAdapt());
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Trigger Autonomous ReAct Agent cycle on input changes
  useEffect(() => {
    if (comments.length === 0) return;
    let isMounted = true;
    setIsRunningAgent(true);

    AutonomousAgentEngine.executeReasoningCycle(comments, 'Singularity Continuous Perception')
      .then((report) => {
        if (isMounted) {
          setAgentReport(report);
          setIsRunningAgent(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsRunningAgent(false);
      });

    return () => {
      isMounted = false;
    };
  }, [comments]);

  return (
    <section className="card singularity-hud" style={{ background: '#030712', color: '#f9fafb', borderColor: '#1f2937', marginTop: '1.5rem', padding: '1.5rem' }}>
      {/* Title & Autonomous Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(147, 51, 234, 0.2)', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
            <Cpu size={24} color="#C084FC" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#F3F4F6' }}>
                Singularity Protocol™ V2.5
              </h2>
              <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#C084FC', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                Autonomous Core
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              Self-Optimizing Meta-Kernel • Autonomous ReAct Agent • Headless Infrastructure Protocol
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: kernelStatus.circuitBreakerTripped ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)', color: kernelStatus.circuitBreakerTripped ? '#EF4444' : '#10B981', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Self-Healing: {kernelStatus.circuitBreakerTripped ? 'Degraded Fallback' : 'Active (Healthy)'}
          </span>
        </div>
      </div>

      {/* Grid: Telemetry & Autonomous Agent */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Meta-Architecture Telemetry Panel */}
        <div style={{ background: '#111827', borderRadius: '8px', padding: '1.25rem', border: '1px solid #1F2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} color="#60A5FA" />
            Meta-Architecture Telemetry & Auto-Tuning
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#0F172A', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>EXECUTION PATH</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38BDF8', marginTop: '0.2rem' }}>
                {kernelStatus.activeStrategy}
              </div>
            </div>

            <div style={{ background: '#0F172A', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>ADAPTIVE CACHE RATIO</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399', marginTop: '0.2rem' }}>
                {(telemetry.cacheHitRatio * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ background: '#0F172A', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>AVG LATENCY / P95</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FCD34D', marginTop: '0.2rem' }}>
                {telemetry.averageLatencyMs}ms / {telemetry.p95LatencyMs}ms
              </div>
            </div>

            <div style={{ background: '#0F172A', padding: '0.75rem', borderRadius: '6px', border: '1px solid #1E293B' }}>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>HEALED ANOMALIES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A78BFA', marginTop: '0.2rem' }}>
                {kernelStatus.healedAnomaliesCount} events
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8', background: '#030712', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #1E293B' }}>
            <span style={{ color: '#38BDF8', fontWeight: 600 }}>Dynamic Supervisor: </span>
            {kernelStatus.lastAdaptationReason}
          </div>
        </div>

        {/* Autonomous ReAct Reasoning Engine Panel */}
        <div style={{ background: '#111827', borderRadius: '8px', padding: '1.25rem', border: '1px solid #1F2937' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={16} color="#C084FC" />
              Autonomous ReAct Reasoning Cycle
            </h3>
            {isRunningAgent && (
              <span style={{ fontSize: '0.7rem', color: '#C084FC', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C084FC', display: 'inline-block' }} /> Reasoning…
              </span>
            )}
          </div>

          {agentReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {agentReport.steps.map((step) => (
                <div key={step.stepNumber} style={{ background: '#0F172A', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #1E293B', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontWeight: 600 }}>
                    <span>STEP {step.stepNumber}: {step.action ? `ACTION: ${step.action}` : 'COGNITION'}</span>
                  </div>
                  <div style={{ color: '#F3F4F6', margin: '0.25rem 0' }}>
                    <span style={{ color: '#C084FC', fontWeight: 600 }}>Thought: </span>{step.thought}
                  </div>
                  {step.observation && (
                    <div style={{ color: '#6EE7B7' }}>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>Observation: </span>{step.observation}
                    </div>
                  )}
                </div>
              ))}

              {agentReport.remediation && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.75rem', color: '#34D399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>Autonomous Action Executed: Dispatched remediation ticket <strong>{agentReport.remediation.acknowledgmentId}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#6B7280', fontSize: '0.8rem', textAlign: 'center', padding: '2rem 0' }}>
              Waiting for incoming comments to initiate cognitive reasoning cycle…
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
