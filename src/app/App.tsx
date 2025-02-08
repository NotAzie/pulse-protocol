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
    const lines = text.split('\n');
    const scored = lines.map(line => ({
      text: line,
      sentiment: scoreComment(line)
    }));
    setItems(scored);
  };

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

      <div style={{ marginTop: '2rem' }}>
        <h2>Feedback Items ({items.length})</h2>
        <ul>
          {items.map((item, i) => (
            <li key={i}>
              <strong>[{item.sentiment}]</strong> {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
