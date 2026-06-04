import React, { useState, useEffect } from 'react';

interface CoachQuestion {
  id: number;
  text: string;
  difficulty: string;
}

interface FeedbackResponse {
  score: number;
  comments: string[];
}

interface SavedCodeAttempt {
  questionText: string;
  language: string;
  code: string;
  score: number;
  comments: string[];
  timestamp: string;
}

const CodePractice: React.FC = () => {
  const [questions, setQuestions] = useState<CoachQuestion[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<CoachQuestion | null>(null);
  const [language, setLanguage] = useState<string>('Python');
  const [code, setCode] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [history, setHistory] = useState<SavedCodeAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('coach_code_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch coach questions
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await fetch('/api/coach/questions');
        if (!resp.ok) throw new Error('Failed to load questions');
        const data = await resp.json();
        setQuestions(data);
        if (data.length > 0) {
          setSelectedQuestion(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Could not fetch coding questions from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectQuestion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const qId = Number(e.target.value);
    const q = questions.find((item) => item.id === qId) || null;
    setSelectedQuestion(q);
    setFeedback(null);
    setCode('');
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !selectedQuestion) return;

    setSubmitting(true);
    setError('');
    try {
      const resp = await fetch('/api/coach/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      if (!resp.ok) throw new Error('Feedback request failed.');
      const data: FeedbackResponse = await resp.json();
      setFeedback(data);

      // Save to history
      const newAttempt: SavedCodeAttempt = {
        questionText: selectedQuestion.text,
        language,
        code,
        score: data.score,
        comments: data.comments,
        timestamp: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      
      const updatedHistory = [newAttempt, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('coach_code_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setError('Failed to review code. Make sure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-easy';
      case 'medium': return 'badge-medium';
      case 'hard': return 'badge-hard';
      default: return '';
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('coach_code_history');
  };

  return (
    <div className="dashboard-grid fade-in-el">
      {/* Code Editor Form */}
      <div className="glow-card">
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>
          Code Assessment Coach
        </h2>

        {error && <p style={{ color: 'var(--accent-coral)', marginBottom: '1rem', textAlign: 'left' }}>{error}</p>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading coach questions...</p>
        ) : (
          <form onSubmit={handleSubmitCode}>
            <div className="form-group">
              <label htmlFor="question-select">Select a Coding Challenge:</label>
              <select id="question-select" onChange={handleSelectQuestion} value={selectedQuestion?.id || ''}>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    [{q.difficulty}] {q.text.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>

            {selectedQuestion && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Challenge Details</span>
                  <span className={`badge ${getDifficultyBadgeClass(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <p style={{ fontWeight: '600', fontSize: '1rem', lineHeight: '1.4' }}>
                  {selectedQuestion.text}
                </p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="code-language">Language:</label>
                  <select
                    id="code-language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    <option value="Python">Python</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="code-input">Write your solution:</label>
              <textarea
                id="code-input"
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`def solve():\n    # Write your technical response or code snippet here\n    pass`}
                style={{
                  fontFamily: 'Courier New, Courier, monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  background: '#0b0f19',
                  border: '1px solid var(--border-light)',
                  color: '#e2e8f0',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!code.trim() || submitting || !selectedQuestion}
              style={{ width: '100%' }}
            >
              {submitting ? 'Analyzing Code...' : 'Submit Code for Feedback'}
            </button>
          </form>
        )}
      </div>

      {/* Code Feedback Display / Attempt History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Latest Feedback */}
        {feedback && (
          <div className="glow-card fade-in-el" style={{ textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', textAlign: 'left' }}>
              Review Analysis
            </h3>
            
            <div className="score-container">
              <div className="score-circle">
                <div className="score-value">{feedback.score}</div>
                <div className="score-label">Score</div>
              </div>
            </div>

            <div style={{ textAlign: 'left', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>Coach Suggestions:</h4>
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                {feedback.comments.map((comment, index) => (
                  <li key={index} style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '0.5rem',
                    borderLeft: '3px solid var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>💡</span> {comment}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Attempt History */}
        <div className="glow-card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)' }}>Submission History</h3>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1.5rem 0' }}>
              No code reviews logged yet. Submit a solution above.
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {history.map((attempt, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{attempt.timestamp}</span>
                    <span style={{
                      background: attempt.score >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: attempt.score >= 70 ? '#34d399' : '#fbbf24',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      Score: {attempt.score}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.25rem', color: '#f1f5f9' }}>
                    "{attempt.questionText.substring(0, 60)}..."
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Language: {attempt.language}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePractice;
