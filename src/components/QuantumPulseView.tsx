import { useEffect, useRef } from 'react';
import type { QuantumPulseAnalysis } from '../core/pulse/engine';
import { Zap, Activity, AlertTriangle, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface QuantumPulseViewProps {
  data: QuantumPulseAnalysis;
}

export function QuantumPulseView({ data }: QuantumPulseViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { tensor, causal, prescriptions, executionTimeMs, totalComments } = data;

  // Real-time canvas particle force field simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const height = (canvas.height = 200);

    // Seed particles representing comments
    const particles = Array.from({ length: Math.min(60, totalComments || 30) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 2 + Math.random() * 3,
      charge: tensor.meanValence >= 0 ? 1 : -1,
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Force center wells
      const cy = height / 2;
      const targetX = tensor.meanValence > 0 ? width * 0.75 : width * 0.25;

      for (const p of particles) {
        // Gravitational attraction to valence center
        const dx = targetX - p.x;
        const dy = cy - p.y;
        p.vx += dx * 0.001 * (1 + tensor.meanArousal);
        p.vy += dy * 0.001;

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.charge > 0 ? '#10B981' : '#EF4444';
        ctx.shadowColor = p.charge > 0 ? '#10B981' : '#EF4444';
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [tensor, totalComments]);

  return (
    <div className="quantum-hud card" style={{ background: '#090d16', color: '#f8fafc', borderColor: '#1e293b' }}>
      {/* Header telemetry banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Cpu size={24} color="#10B981" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              QuantumPulse Matrix™ V2
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Multi-Dimensional Cognitive Field • Bitwise SimHash Embeddings • PageRank Causal Topology
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
            <Zap size={13} /> {executionTimeMs} ms Latency
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            O(1) Streaming Ingestion
          </div>
        </div>
      </div>

      {/* Force-directed vector resonance field */}
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e293b', marginBottom: '1.5rem' }}>
        <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10, fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={14} color="#10B981" />
          Semantic Vector Resonance Field (60 FPS Physical Well)
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', height: '140px', display: 'block' }} />
      </div>

      {/* Affect Tensor Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valence Coordinate</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: tensor.meanValence >= 0 ? '#10B981' : '#F87171', marginTop: '0.25rem' }}>
            {tensor.meanValence > 0 ? `+${tensor.meanValence}` : tensor.meanValence}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {tensor.meanValence > 0.2 ? 'Systemic Pleasure' : tensor.meanValence < -0.2 ? 'Systemic Discontent' : 'Equilibrium'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Arousal (Urgency)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: tensor.meanArousal > 0.6 ? '#F59E0B' : '#60A5FA', marginTop: '0.25rem' }}>
            {(tensor.meanArousal * 100).toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {tensor.meanArousal > 0.6 ? 'High Emotional Volatility' : 'Measured & Calm'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Friction Velocity (dF/dt)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: tensor.frictionVelocity > 0.1 ? '#EF4444' : '#10B981', marginTop: '0.25rem' }}>
            {tensor.frictionVelocity > 0 ? `+${tensor.frictionVelocity}` : tensor.frictionVelocity}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {tensor.frictionVelocity > 0.1 ? 'Accelerating Friction' : 'De-escalating Friction'}
          </div>
        </div>

        <div style={{ background: '#111827', padding: '1rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Polarization Entropy</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A78BFA', marginTop: '0.25rem' }}>
            {tensor.polarizationEntropy}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {tensor.bimodalClustering ? 'Fractured Opinion Clusters' : 'Cohesive Alignment'}
          </div>
        </div>
      </div>

      {/* Ghost Signal Predictive Radar */}
      {causal.ghostSignals.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontWeight: 700, marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} />
            The Unfair Advantage: Ghost Signal Predictive Radar™
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {causal.ghostSignals.map((ghost) => (
              <div key={ghost.id} style={{ background: '#111827', border: '1px solid #374151', borderRadius: '6px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#F3F4F6' }}>{ghost.targetDomain}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '2px 6px', borderRadius: '4px' }}>
                    {(ghost.riskProbability * 100).toFixed(0)}% Probability
                  </span>
                </div>
                <p style={{ margin: '0.4rem 0 0.5rem 0', fontSize: '0.8rem', color: '#9CA3AF' }}>
                  {ghost.precursorPattern}
                </p>
                <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
                  Forecast Window: Next {ghost.forecastWindowHours} hours
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Root-Cause Causal DAG & Prescriptive Action Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Causal DAG */}
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={16} color="#38BDF8" />
            Topological Causal Dependency Graph
          </h3>
          {causal.rootCauseNode && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase' }}>
                Primary Root Cause Isolated
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FDE68A', marginTop: '0.2rem' }}>
                {causal.rootCauseNode.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.2rem' }}>
                Centrality Index: {causal.rootCauseNode.centrality} (High upstream friction driver)
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {causal.edges.map((e, idx) => (
              <div key={idx} style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0F172A', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{e.from}</span>
                <ArrowRight size={14} color="#38BDF8" />
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{e.to}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#64748B' }}>{(e.confidence * 100).toFixed(0)}% conf</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptive Interventions */}
        <div style={{ background: '#111827', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="#10B981" />
            Prescriptive Executive Interventions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {prescriptions.slice(0, 3).map((act) => (
              <div key={act.id} style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600, color: '#F1F5F9', fontSize: '0.85rem' }}>{act.title}</div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                    +{act.projectedFrictionReduction}% Reduction
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0.3rem 0' }}>{act.description}</div>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: '#64748B' }}>
                  <span>Target: {act.domain}</span>
                  <span>ROI Score: {act.roiScore}/10</span>
                  <span>Effort: {act.implementationEffort}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quantum Pulse Matrix HUD telemetry components active

// Neon luminescent HUD glassmorphism polish
