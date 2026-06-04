import React, { useState, useEffect } from 'react';

interface Question {
  category: string;
  question: string;
}

interface SavedAnswer {
  questionText: string;
  category: string;
  userAnswer: string;
  notes: string;
  timestamp: string;
}

const InterviewPrep: React.FC = () => {
  const [category, setCategory] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('coach_saved_answers');
    if (saved) {
      try {
        setSavedAnswers(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved answers', e);
      }
    }
  }, []);

  const fetchQuestion = async (selectedCat = category) => {
    setLoading(true);
    setError('');
    setSubmitted(false);
    setUserAnswer('');
    setNotes('');
    setShowTips(false);
    
    try {
      let url = '/api/interview/question';
      if (selectedCat) {
        url += `?category=${encodeURIComponent(selectedCat)}`;
      }
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error('Could not fetch question');
      }
      const data = await resp.json();
      setCurrentQuestion(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch a question. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial question
  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setCategory(cat);
    fetchQuestion(cat);
  };

  const handleSaveResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim()) return;

    const newAnswer: SavedAnswer = {
      questionText: currentQuestion.question,
      category: currentQuestion.category,
      userAnswer,
      notes,
      timestamp: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [newAnswer, ...savedAnswers];
    setSavedAnswers(updated);
    localStorage.setItem('coach_saved_answers', JSON.stringify(updated));
    setSubmitted(true);
  };

  const deleteSavedAnswer = (indexToDelete: number) => {
    const updated = savedAnswers.filter((_, i) => i !== indexToDelete);
    setSavedAnswers(updated);
    localStorage.setItem('coach_saved_answers', JSON.stringify(updated));
  };

  // Basic heuristical check of the user's answer
  const getHeuristicFeedback = () => {
    if (!userAnswer) return null;
    const length = userAnswer.split(/\s+/).length;
    if (length < 15) {
      return {
        rating: 'Short Answer',
        color: '#f87171',
        advice: 'Try to elaborate. A good technical response usually has at least 3-4 structured sentences with examples.',
      };
    } else if (length < 40) {
      return {
        rating: 'Good Start',
        color: '#fbbf24',
        advice: 'You have a solid explanation. Try to outline architectural trade-offs or practical coding experiences to make it stellar.',
      };
    } else {
      return {
        rating: 'Comprehensive Response',
        color: '#34d399',
        advice: 'Excellent length and detail. Be sure to review standard docs to verify specific technical term definitions.',
      };
    }
  };

  const feedback = getHeuristicFeedback();

  return (
    <div className="dashboard-grid fade-in-el">
      {/* Current Question and Answer Panel */}
      <div className="glow-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>Interactive Mock Interview</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label htmlFor="category-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</label>
            <select
              id="category-select"
              value={category}
              onChange={handleCategoryChange}
              style={{ width: 'auto', padding: '0.4rem 1.5rem 0.4rem 0.6rem', fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              <option value="FastAPI">FastAPI</option>
              <option value="Data Analysis">Data Analysis</option>
              <option value="GenAI">GenAI</option>
            </select>
          </div>
        </div>

        {error && <p style={{ color: 'var(--accent-coral)', margin: '1rem 0' }}>{error}</p>}

        {loading ? (
          <div style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>Loading new question...</div>
        ) : currentQuestion ? (
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <span className={`badge badge-medium`}>{currentQuestion.category}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mock Prep Question</span>
            </div>
            
            <p style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'left', lineHeight: '1.5' }}>
              "{currentQuestion.question}"
            </p>

            <form onSubmit={handleSaveResponse}>
              <div className="form-group">
                <label htmlFor="interview-answer">Your Verbal/Written Response:</label>
                <textarea
                  id="interview-answer"
                  rows={4}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Draft your explanation here. Focus on clear structures, key terminology, and concrete examples..."
                />
              </div>

              {userAnswer && feedback && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${feedback.color}40`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  <p style={{ fontWeight: '700', color: feedback.color, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: feedback.color }}></span>
                    Evaluation: {feedback.rating}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{feedback.advice}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="interview-notes">Personal Coach Notes & Takeaways:</label>
                <input
                  id="interview-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Mention async/await event loops, remember to mention pd.isnull()"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!userAnswer.trim() || submitted}
                >
                  {submitted ? 'Response Saved' : 'Save & Log Practice'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => fetchQuestion()}
                >
                  Skip / Next
                </button>
              </div>
            </form>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No question active.</p>
        )}
      </div>

      {/* Answer Log History */}
      <div className="glow-card">
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>Practice Log</h2>
        
        {savedAnswers.length === 0 ? (
          <div style={{ padding: '2rem 0', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <p>No logged practice responses yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Complete current questions to track your interview prep history.</p>
          </div>
        ) : (
          <div className="timeline" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {savedAnswers.map((item, idx) => (
              <div className="timeline-item" key={idx} style={{ borderLeftColor: 'var(--primary)' }}>
                <div className="timeline-meta">
                  <div>{item.timestamp}</div>
                  <span className="badge badge-easy" style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.7rem' }}>
                    {item.category}
                  </span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-title" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    "{item.questionText}"
                  </div>
                  <div style={{ margin: '0.5rem 0', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: '#e2e8f0' }}>
                    <strong>Your Response:</strong> {item.userAnswer}
                  </div>
                  {item.notes && (
                    <div className="timeline-desc" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💡 Coach Note: {item.notes}
                    </div>
                  )}
                  <button
                    onClick={() => deleteSavedAnswer(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-coral)',
                      padding: 0,
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
