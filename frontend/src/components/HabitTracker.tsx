import React, { useState, useEffect } from 'react';

interface HabitEntry {
  date: string;
  activity: string;
  duration_minutes: number;
}

const HabitTracker: React.FC = () => {
  const [activity, setActivity] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [history, setHistory] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/habit/history');
      if (!resp.ok) throw new Error('Failed to load habit history');
      const data = await resp.json();
      
      // Sort history descending by date
      const sorted = data.sort((a: HabitEntry, b: HabitEntry) => b.date.localeCompare(a.date));
      setHistory(sorted);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve habit logs. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || duration <= 0 || !date) {
      setError('Please fill in all fields correctly.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const resp = await fetch('/api/habit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          activity: activity.trim(),
          duration_minutes: Number(duration),
        }),
      });

      if (!resp.ok) throw new Error('Logging habit failed.');
      
      setSuccess('Habit logged successfully!');
      setActivity('');
      // Reload history
      await fetchHistory();
    } catch (err) {
      console.error(err);
      setError('Failed to log habit. Make sure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const totalMinutes = history.reduce((sum, item) => sum + item.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgSession = history.length > 0 ? Math.round(totalMinutes / history.length) : 0;

  return (
    <div className="dashboard-grid fade-in-el">
      {/* Log Form */}
      <div className="glow-card" style={{ height: 'fit-content' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>
          Log Study Activity
        </h2>

        {error && <p style={{ color: 'var(--accent-coral)', marginBottom: '1rem', textAlign: 'left' }}>{error}</p>}
        {success && <p style={{ color: 'var(--secondary)', marginBottom: '1rem', textAlign: 'left' }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="habit-activity">Activity description:</label>
            <input
              id="habit-activity"
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., Read FastAPI docs, Leetcode practice"
              list="suggested-activities"
            />
            <datalist id="suggested-activities">
              <option value="LeetCode Practice" />
              <option value="Read FastAPI Docs" />
              <option value="System Design Study" />
              <option value="Mock Interview Practice" />
              <option value="Build Portfolio Project" />
            </datalist>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="habit-duration">Duration (mins):</label>
              <input
                id="habit-duration"
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="habit-date">Date:</label>
              <input
                id="habit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !activity.trim()}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {submitting ? 'Logging...' : 'Log Session'}
          </button>
        </form>
      </div>

      {/* Stats and History Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem'
        }}>
          <div className="glow-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>
              {history.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Sessions
            </div>
          </div>
          <div className="glow-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>
              {totalHours}h
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Total Time
            </div>
          </div>
          <div className="glow-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
              {avgSession}m
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Avg Session
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="glow-card" style={{ flex: 1 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>
            Habit Timeline
          </h3>

          {loading && history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Retrieving logs...</p>
          ) : history.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-muted)', border: '1px dashed var(--border-light)', borderRadius: 'var(--radius-md)' }}>
              <p>No habits logged yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Start logging sessions to build your daily streaks.</p>
            </div>
          ) : (
            <div className="timeline" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {history.map((item, index) => (
                <div className="timeline-item" key={index}>
                  <div className="timeline-meta">
                    <div>{item.date}</div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">{item.activity}</div>
                    <div className="timeline-desc">
                      ⏱️ Logged {item.duration_minutes} minutes of dedicated learning
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
