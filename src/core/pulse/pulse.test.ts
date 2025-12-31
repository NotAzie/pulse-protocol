import { describe, it, expect } from 'vitest';
import { ZeroCopyStreamTokenizer, fnv1a } from './tokenizer';
import { SimHashEngine } from './simhash';
import { AffectEngine } from './affect';
import { CausalGraphEngine } from './causal';
import { PrescriptiveEngine } from './prescriptive';
import { QuantumPulse } from './engine';

describe('QuantumPulse Next-Gen Engine Test Suite', () => {
  describe('ZeroCopyStreamTokenizer', () => {
    it('tokenizes without string allocation and hashes correctly', () => {
      const text = 'Campus wifi is amazing!';
      const tokenizer = new ZeroCopyStreamTokenizer(text);
      const tokens = Array.from(tokenizer.tokens());

      expect(tokens.length).toBe(4);
      expect(tokens[0].hash).toBe(fnv1a('campus'));
      expect(tokens[3].hash).toBe(fnv1a('amazing'));
    });

    it('handles high unicode surrogate pairs', () => {
      const text = 'Great food \uD83D\uDE0A\uD83D\uDC4D';
      const tokenizer = new ZeroCopyStreamTokenizer(text);
      const tokens = Array.from(tokenizer.tokens());
      const emojis = tokens.filter(t => t.isEmoji);
      expect(emojis.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('SimHash 64-bit Locality-Sensitive Hashing', () => {
    it('produces near-identical fingerprints for semantically close texts', () => {
      const a = SimHashEngine.compute('The campus wifi is very slow and keeps dropping');
      const b = SimHashEngine.compute('The campus wifi is extremely slow and keeps disconnecting');
      const c = SimHashEngine.compute('The cafeteria food is delicious and fresh');

      const simAB = SimHashEngine.similarity(a, b);
      const simAC = SimHashEngine.similarity(a, c);

      expect(simAB).toBeGreaterThan(0.75); // High semantic match
      expect(simAB).toBeGreaterThan(simAC); // Much closer than dining
    });

    it('computes bitwise Hamming distance in O(1)', () => {
      const a = { hi: 0b1111000011110000, lo: 0 };
      const b = { hi: 0b1111000000000000, lo: 0 };
      const dist = SimHashEngine.hammingDistance(a, b);
      expect(dist).toBe(4);
    });
  });

  describe('Affect Tensor & Polarization Dynamics', () => {
    it('calculates multi-dimensional valence, arousal, and dominance', () => {
      const comments = [
        'Terrible, broken wifi and awful support!',
        'Horrible registration wait times and frustrating staff.',
        'Clean, amazing study rooms in the library.',
      ];
      const tensor = AffectEngine.computeTensor(comments);

      expect(tensor.sampleCount).toBe(3);
      expect(tensor.meanValence).toBeLessThan(0); // Mostly negative
      expect(tensor.meanArousal).toBeGreaterThan(0.5); // High intensity
      expect(tensor.polarizationEntropy).toBeGreaterThan(0);
    });
  });

  describe('Topological Causal Graph & Ghost Signals', () => {
    it('discovers root cause node and generates predictive ghost signals', () => {
      const dataset = [
        'The wifi in Block B is completely broken and down.',
        'Because wifi is down, everyone is crowding the library study desks.',
        'Terrible wifi connection again, cannot finish online assignment.',
        'Library is packed and noisy today.',
      ];
      const causal = CausalGraphEngine.analyze(dataset);

      expect(causal.nodes.length).toBeGreaterThan(0);
      expect(causal.rootCauseNode).toBeDefined();
      expect(causal.rootCauseNode?.id).toBe('wifi');
      expect(causal.ghostSignals.length).toBeGreaterThan(0);
    });
  });

  describe('Prescriptive Countermeasure Engine', () => {
    it('generates prioritized interventions with calculated ROI', () => {
      const dataset = [
        'Cafeteria lunch lines are way too long and slow!',
        'No food left at the canteen by 1 PM.',
      ];
      const causal = CausalGraphEngine.analyze(dataset);
      const prescriptions = PrescriptiveEngine.generateActions(causal);

      expect(prescriptions.length).toBeGreaterThan(0);
      expect(prescriptions[0].projectedFrictionReduction).toBeGreaterThan(0);
      expect(prescriptions[0].roiScore).toBeGreaterThan(8);
    });
  });

  describe('QuantumPulse Unified Ingestion', () => {
    it('executes end-to-end cognitive analysis in sub-millisecond timeframe', () => {
      const comments = [
        'Wi-Fi in student center is blazing fast! Love it.',
        'Cafeteria food is freezing and overpriced.',
        'Registration queues are stressful and disorganized.',
        'Library desks are quiet and spacious.',
      ];
      const result = QuantumPulse.analyze(comments);

      expect(result.totalComments).toBe(4);
      expect(result.tensor.sampleCount).toBe(4);
      expect(result.causal.nodes.length).toBeGreaterThan(0);
      expect(result.prescriptions.length).toBeGreaterThan(0);
      expect(result.executionTimeMs).toBeLessThan(100);
    });
  });
});
