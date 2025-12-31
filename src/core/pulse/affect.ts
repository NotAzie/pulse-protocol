/**
 * Multi-Dimensional Affect Tensor & Online Reservoir Dynamics
 *
 * Models collective student sentiment not as a naive 1D scalar, but as a
 * multi-dimensional state vector:
 * 1. Valence (Pleasure / Displeasure): [-1.0, 1.0]
 * 2. Arousal (Urgency / Calm): [0.0, 1.0]
 * 3. Dominance (Agency / Helplessness): [0.0, 1.0]
 * 4. Friction Velocity (dF/dt): Temporal/batch acceleration of frustration
 * 5. Polarization Entropy (H): Shannon entropy detecting fractured/bimodal opinion clusters
 */

import { fnv1a, ZeroCopyStreamTokenizer } from './tokenizer';

export interface AffectPoint {
  valence: number;
  arousal: number;
  dominance: number;
}

export interface AffectTensor {
  meanValence: number;
  meanArousal: number;
  meanDominance: number;
  frictionVelocity: number;
  polarizationEntropy: number;
  sampleCount: number;
  bimodalClustering: boolean;
}

// Pre-computed Affect Lexicon with V-A-D coordinates
const RAW_LEXICON: Record<string, AffectPoint> = {
  amazing: { valence: 0.92, arousal: 0.75, dominance: 0.8 },
  excellent: { valence: 0.88, arousal: 0.65, dominance: 0.75 },
  great: { valence: 0.8, arousal: 0.6, dominance: 0.7 },
  peaceful: { valence: 0.75, arousal: 0.15, dominance: 0.7 },
  helpful: { valence: 0.78, arousal: 0.45, dominance: 0.72 },
  clean: { valence: 0.7, arousal: 0.3, dominance: 0.65 },
  fast: { valence: 0.75, arousal: 0.6, dominance: 0.7 },
  smooth: { valence: 0.72, arousal: 0.25, dominance: 0.68 },

  terrible: { valence: -0.92, arousal: 0.88, dominance: 0.2 },
  awful: { valence: -0.88, arousal: 0.82, dominance: 0.25 },
  broken: { valence: -0.85, arousal: 0.78, dominance: 0.3 },
  unacceptable: { valence: -0.89, arousal: 0.85, dominance: 0.35 },
  frustrating: { valence: -0.82, arousal: 0.8, dominance: 0.32 },
  expensive: { valence: -0.65, arousal: 0.7, dominance: 0.4 },
  crowded: { valence: -0.6, arousal: 0.75, dominance: 0.38 },

  boring: { valence: -0.65, arousal: 0.2, dominance: 0.3 },
  slow: { valence: -0.68, arousal: 0.45, dominance: 0.35 },
  confusing: { valence: -0.7, arousal: 0.55, dominance: 0.28 },
  useless: { valence: -0.85, arousal: 0.4, dominance: 0.2 },
};

// O(1) Integer Hash Dispatch Map
const HASH_LEXICON = new Map<number, AffectPoint>();
for (const [k, v] of Object.entries(RAW_LEXICON)) {
  HASH_LEXICON.set(fnv1a(k), v);
}

export class AffectEngine {
  /**
   * Fast token-streaming score into 3D Affect space using direct integer hash lookups.
   */
  static scoreText(text: string): AffectPoint {
    const tokenizer = new ZeroCopyStreamTokenizer(text);
    let sumV = 0;
    let sumA = 0;
    let sumD = 0;
    let matched = 0;

    tokenizer.scan((token) => {
      const pt = HASH_LEXICON.get(token.hash);
      if (pt) {
        sumV += pt.valence;
        sumA += pt.arousal;
        sumD += pt.dominance;
        matched++;
      }
    });

    if (matched === 0) {
      return { valence: 0, arousal: 0.25, dominance: 0.5 };
    }

    return {
      valence: Math.max(-1, Math.min(1, sumV / matched)),
      arousal: Math.max(0, Math.min(1, sumA / matched)),
      dominance: Math.max(0, Math.min(1, sumD / matched)),
    };
  }

  /**
   * Accumulates a batch or stream of comments into a unified Affect Tensor.
   * Calculates Shannon Polarization Entropy and Friction Velocity.
   */
  static computeTensor(comments: string[]): AffectTensor {
    const n = comments.length;
    if (n === 0) {
      return {
        meanValence: 0,
        meanArousal: 0,
        meanDominance: 0.5,
        frictionVelocity: 0,
        polarizationEntropy: 0,
        sampleCount: 0,
        bimodalClustering: false,
      };
    }

    let sumV = 0;
    let sumA = 0;
    let sumD = 0;

    let negCount = 0;
    let neuCount = 0;
    let posCount = 0;

    const mid = Math.floor(n / 2);
    let earlyFrustration = 0;
    let lateFrustration = 0;

    for (let i = 0; i < n; i++) {
      const pt = AffectEngine.scoreText(comments[i]);
      sumV += pt.valence;
      sumA += pt.arousal;
      sumD += pt.dominance;

      if (pt.valence < -0.2) negCount++;
      else if (pt.valence > 0.2) posCount++;
      else neuCount++;

      const frustration = (1 - pt.valence) * pt.arousal;
      if (i < mid) earlyFrustration += frustration;
      else lateFrustration += frustration;
    }

    const meanV = sumV / n;
    const meanA = sumA / n;
    const meanD = sumD / n;

    const earlyAvg = mid > 0 ? earlyFrustration / mid : 0;
    const lateAvg = (n - mid) > 0 ? lateFrustration / (n - mid) : 0;
    const frictionVelocity = Math.max(-1, Math.min(1, (lateAvg - earlyAvg) * 1.5));

    const pNeg = negCount / n;
    const pNeu = neuCount / n;
    const pPos = posCount / n;

    const entropy = -(
      (pNeg > 0 ? pNeg * Math.log2(pNeg) : 0) +
      (pNeu > 0 ? pNeu * Math.log2(pNeu) : 0) +
      (pPos > 0 ? pPos * Math.log2(pPos) : 0)
    ) / Math.log2(3);

    const bimodal = pPos > 0.3 && pNeg > 0.3 && pNeu < 0.25;

    return {
      meanValence: Number(meanV.toFixed(3)),
      meanArousal: Number(meanA.toFixed(3)),
      meanDominance: Number(meanD.toFixed(3)),
      frictionVelocity: Number(frictionVelocity.toFixed(3)),
      polarizationEntropy: Number(entropy.toFixed(3)),
      sampleCount: n,
      bimodalClustering: bimodal,
    };
  }
}
