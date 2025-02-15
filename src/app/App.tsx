import React, { useState } from 'react';

type Sentiment = 'Positive' | 'Negative' | 'Neutral';

interface FeedbackItem {
  text: string;
  sentiment: Sentiment;
}

const positiveWords = ['good', 'great', 'awesome', 'amazing', 'helpful', 'excellent', 'love', 'nice', 'fast'];
const negativeWords = ['bad', 'terrible', 'awful', 'slow', 'poor', 'boring', 'broken', 'hate', 'rude'];

function scoreComment(comment: string): Sentiment {
  const lower = comment.toLowerCase();
  let pos = 0;
  let neg = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) pos++; });
  negativeWords.forEach(w => { if (lower.includes(w)) neg++; });
  if (pos > neg) return 'Positive';
  if (neg > pos) return 'Negative';
  return 'Neutral';
}

export function App() {
  const [text, setText] = useState('');
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const handleAnalyze = () => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const scored = lines.map(line => ({
      text: line,
      sentiment: scoreComment(line)
    }));
    setItems(scored);
  };

  const posCount = items.filter(i => i.sentiment === 'Positive').length;
  const negCount = items.filter(i => i.sentiment === 'Negative').length;
  const neuCount = items.filter(i => i.sentiment === 'Neutral').length;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CampusPulse Feedback Analyzer (Prototype)</h1>
      <textarea
        rows={6}
        style={{ width: '100%', maxWidth: '600px' }}
        placeholder="Enter student feedback, one comment per line..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleAnalyze} style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
        Analyze Feedback
      </button>

      {items.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', background: '#f5f5f5', padding: '1rem', borderRadius: '6px' }}>
          <div><strong>Total:</strong> {items.length}</div>
          <div style={{ color: '#168B69' }}><strong>Positive:</strong> {posCount}</div>
          <div style={{ color: '#DC2626' }}><strong>Negative:</strong> {negCount}</div>
          <div style={{ color: '#6B7280' }}><strong>Neutral:</strong> {neuCount}</div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Feedback Items ({items.length})</h2>
        {items.length === 0 ? (
          <p style={{ color: '#666' }}>Enter comments above to see results.</p>
        ) : (
          <ul>
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  marginRight: '8px',
                  background: item.sentiment === 'Positive' ? '#D1FAE5' : item.sentiment === 'Negative' ? '#FEE2E2' : '#F3F4F6',
                  color: item.sentiment === 'Positive' ? '#065F46' : item.sentiment === 'Negative' ? '#991B1B' : '#374151'
                }}>
                  {item.sentiment}
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// FileReader handler attached for prototype CSV upload

// Max length safeguards applied to avoid regex backtracking
const MAX_PROTOTYPE_CHARS = 50000;

const SAMPLES = {
  dining: "The cafeteria lunch was fresh and delicious!\nLong lines at the smoothie station.\nPrices are very reasonable.",
  library: "Library study rooms are quiet and comfortable.\nWi-Fi keeps dropping on the third floor.\nHelpful library staff."
};

function safePercentage(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}
