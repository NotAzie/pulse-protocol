export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

export interface FeedbackEntry {
  id: string;
  originalText: string;
  sentiment: Sentiment;
  score: number;
}

const positiveWords = ['good', 'great', 'awesome', 'amazing', 'helpful', 'excellent', 'love', 'nice', 'fast', 'improved'];
const negativeWords = ['bad', 'terrible', 'awful', 'slow', 'poor', 'boring', 'broken', 'hate', 'rude', 'frustrating'];

export function normalizeForAnalysis(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

export function scoreSentence(text: string): { sentiment: Sentiment; score: number } {
  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;
  for (const w of positiveWords) {
    if (lower.includes(w)) pos += 1;
  }
  for (const w of negativeWords) {
    if (lower.includes(w)) neg += 1;
  }
  const score = (pos - neg) / (Math.max(1, pos + neg));
  if (score > 0.1) return { sentiment: 'Positive', score };
  if (score < -0.1) return { sentiment: 'Negative', score };
  return { sentiment: 'Neutral', score };
}
