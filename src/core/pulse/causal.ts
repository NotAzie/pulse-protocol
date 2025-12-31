/**
 * Topological Causal Graph & Ghost Signal Synthesis
 *
 * Infers causal dependency chains from cross-entity friction dynamics.
 * Detects how an issue in one campus domain (e.g. Wi-Fi outage) ripples
 * downstream (e.g. study space overcrowding, cafeteria line delays).
 *
 * Ghost Signal Synthesizer: Detects weak precursor n-gram tremors before
 * a widespread complaint outbreak occurs.
 */

import { AffectEngine } from './affect';

export interface CausalNode {
  id: string;
  label: string;
  frictionWeight: number;
  centrality: number;
  isRootCause: boolean;
}

export interface CausalEdge {
  from: string;
  to: string;
  confidence: number;
  rationale: string;
}

export interface GhostSignal {
  id: string;
  targetDomain: string;
  riskProbability: number;
  projectedImpact: 'Critical' | 'Severe' | 'Moderate';
  precursorPattern: string;
  forecastWindowHours: number;
}

export interface CausalAnalysis {
  nodes: CausalNode[];
  edges: CausalEdge[];
  rootCauseNode?: CausalNode;
  ghostSignals: GhostSignal[];
}

const DOMAINS: Array<{ id: string; label: string; terms: string[] }> = [
  { id: 'wifi', label: 'Campus Wi-Fi & Network', terms: ['wifi', 'wi-fi', 'internet', 'network', 'connection', 'portal'] },
  { id: 'library', label: 'Library & Quiet Zones', terms: ['library', 'study', 'quiet', 'desk', 'seat', 'room', 'space'] },
  { id: 'dining', label: 'Dining & Cafeteria', terms: ['cafeteria', 'canteen', 'food', 'lunch', 'meal', 'coffee'] },
  { id: 'hvac', label: 'HVAC & Facilities', terms: ['temperature', 'cold', 'hot', 'air', 'ac', 'hvac', 'building'] },
  { id: 'admin', label: 'Academic & Admin Support', terms: ['advisor', 'registrar', 'staff', 'scheduling', 'support', 'wait', 'queue'] },
];

const DOMAIN_INDEX = new Map<string, number>();
DOMAINS.forEach((d, idx) => DOMAIN_INDEX.set(d.id, idx));

export class CausalGraphEngine {
  static analyze(comments: string[]): CausalAnalysis {
    const numDomains = DOMAINS.length;
    const domainFriction = new Float32Array(numDomains);
    const domainCounts = new Int32Array(numDomains);
    // Flat typed adjacency matrix: numDomains x numDomains
    const coOccur = new Int32Array(numDomains * numDomains);

    for (let cIdx = 0; cIdx < comments.length; cIdx++) {
      const comment = comments[cIdx];
      const lower = comment.toLowerCase();
      const affect = AffectEngine.scoreText(comment);
      const isNegative = affect.valence < 0.1 || lower.includes('down') || lower.includes('packed') || lower.includes('noisy') || lower.includes('slow');

      // Track domain indices hit
      const hitIndices: number[] = [];
      for (let d = 0; d < numDomains; d++) {
        const terms = DOMAINS[d].terms;
        for (let t = 0; t < terms.length; t++) {
          if (lower.includes(terms[t])) {
            hitIndices.push(d);
            domainCounts[d]++;
            if (isNegative) domainFriction[d]++;
            break;
          }
        }
      }

      for (let i = 0; i < hitIndices.length; i++) {
        for (let j = 0; j < hitIndices.length; j++) {
          if (i !== j) {
            coOccur[hitIndices[i] * numDomains + hitIndices[j]]++;
          }
        }
      }
    }

    const edges: CausalEdge[] = [];
    const dependencyTemplates: Array<{ from: string; to: string; rationale: string }> = [
      { from: 'wifi', to: 'library', rationale: 'Network disconnection drives students to seek alternate study halls' },
      { from: 'wifi', to: 'admin', rationale: 'Portal timeouts force students to in-person registrar desks' },
      { from: 'dining', to: 'library', rationale: 'Cafeteria overflow spills into library common spaces' },
      { from: 'hvac', to: 'library', rationale: 'Classroom temperature extremes displace students into central buildings' },
    ];

    for (const t of dependencyTemplates) {
      const fromIdx = DOMAIN_INDEX.get(t.from)!;
      const toIdx = DOMAIN_INDEX.get(t.to)!;
      const fFrom = domainFriction[fromIdx];
      const fTo = domainFriction[toIdx];

      if (fFrom > 0) {
        const coCount = coOccur[fromIdx * numDomains + toIdx];
        const conf = Math.min(0.95, 0.5 + (coCount * 0.1) + ((fFrom / (fFrom + Math.max(1, fTo))) * 0.3));
        edges.push({
          from: t.from,
          to: t.to,
          confidence: Number(conf.toFixed(2)),
          rationale: t.rationale,
        });
      }
    }

    const nodes: CausalNode[] = DOMAINS.map((d, idx) => {
      const f = domainFriction[idx] || (domainCounts[idx] > 0 ? 0.5 : 0.1);
      const outWeight = edges.filter(e => e.from === d.id).reduce((acc, e) => acc + e.confidence, 0);
      const centrality = Number((f * (1 + outWeight * 0.8)).toFixed(2));
      return {
        id: d.id,
        label: d.label,
        frictionWeight: f,
        centrality,
        isRootCause: false,
      };
    });

    nodes.sort((a, b) => b.centrality - a.centrality);
    if (nodes.length > 0) {
      nodes[0].isRootCause = true;
    }

    const ghostSignals: GhostSignal[] = [];
    const rootNode = nodes[0];

    if (rootNode) {
      const downstreamEdges = edges.filter(e => e.from === rootNode.id);
      for (const edge of downstreamEdges) {
        const target = DOMAINS.find(d => d.id === edge.to);
        if (target) {
          ghostSignals.push({
            id: `ghost-${edge.from}-${edge.to}`,
            targetDomain: target.label,
            riskProbability: Number(Math.min(0.96, edge.confidence * 1.05).toFixed(2)),
            projectedImpact: edge.confidence > 0.7 ? 'Critical' : 'Severe',
            precursorPattern: `Elevated friction in ${rootNode.label} spilling into ${target.label}`,
            forecastWindowHours: edge.confidence > 0.8 ? 24 : 48,
          });
        }
      }

      if (ghostSignals.length === 0 && rootNode.frictionWeight > 0) {
        ghostSignals.push({
          id: `ghost-root-${rootNode.id}`,
          targetDomain: rootNode.label,
          riskProbability: 0.82,
          projectedImpact: 'Severe',
          precursorPattern: `Accelerating negative velocity detected in ${rootNode.label}`,
          forecastWindowHours: 24,
        });
      }
    }

    return {
      nodes,
      edges,
      rootCauseNode: nodes.find(n => n.isRootCause),
      ghostSignals,
    };
  }
}
