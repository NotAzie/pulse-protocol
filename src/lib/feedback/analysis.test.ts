import { describe, it, expect } from 'vitest';
import { scoreSentence } from '../sentiment/analyze';

describe('Early sentiment scoring heuristic', () => {
  it('correctly classifies positive feedback', () => {
    const res = scoreSentence('The workshop was amazing and very helpful');
    expect(res.sentiment).toBe('Positive');
  });

  it('correctly classifies negative feedback', () => {
    const res = scoreSentence('The session was too long and boring');
    expect(res.sentiment).toBe('Negative');
  });

  it('correctly classifies neutral statements', () => {
    const res = scoreSentence('The event is on Friday');
    expect(res.sentiment).toBe('Neutral');
  });
});
