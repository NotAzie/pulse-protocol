import React, { useState } from 'react';

export function App() {
  const [text, setText] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  const handleAnalyze = () => {
    const lines = text.split('\n');
    setComments(lines);
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
        <h2>Feedback Items ({comments.length})</h2>
        <ul>
          {comments.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
