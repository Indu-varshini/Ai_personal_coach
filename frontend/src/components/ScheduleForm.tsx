import React, { useState, useEffect } from 'react';

interface Activity {
  title: string;
  duration_minutes: number;
}

interface ScheduleResponse {
  total_minutes: number;
  activities: Activity[];
}

const PRESET_TOPICS = ['FastAPI', 'React', 'Data Analysis', 'GenAI', 'System Design', 'Python', 'SQL'];

const ScheduleForm: React.FC = () => {
  const [focusAreas, setFocusAreas] = useState<string>('');
  const [hours, setHours] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(false);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [completedItems, setCompletedItems] = useState<boolean[]>([]);
  const [error, setError] = useState<string>('');

  // Handle focus areas toggled from presets
  const handleTagToggle = (topic: string) => {
    const list = focusAreas.split(',').map(s => s.trim()).filter(Boolean);
    if (list.includes(topic)) {
      setFocusAreas(list.filter(item => item !== topic).join(', '));
    } else {
      setFocusAreas([...list, topic].join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusAreas.trim()) {
      setError('Please enter or select at least one focus area.');
      return;
    }
    setError('');
    setLoading(true);
    setSchedule(null);
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus_areas: focusAreas.split(',').map((s) => s.trim()).filter(Boolean),
          available_hours: Number(hours),
        }),
      });
      if (!response.ok) throw new Error('Network error');
      const data: ScheduleResponse = await response.json();
      setSchedule(data);
      setCompletedItems(new Array(data.activities.length).fill(false));
    } catch (err) {
      console.error(err);
      setError('Failed to generate study schedule. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = (idx: number) => {
    const nextVal = [...completedItems];
    nextVal[idx] = !nextVal[idx];
    setCompletedItems(nextVal);
  };

  // Calculate completion percentage
  const completedCount = completedItems.filter(Boolean).length;
  const totalCount = schedule?.activities.length || 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeTopics = focusAreas.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="dashboard-grid fade-in-el">
      {/* Configuration Panel */}
      <div className="glow-card" style={{ height: 'fit-content' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>
          Schedule Study Focus
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="focus-input">Focus Areas (comma-separated):</label>
            <input
              id="focus-input"
              type="text"
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="e.g., FastAPI, React, Data Analysis"
            />
          </div>

          {/* Quick-select presets */}
          <div className="form-group">
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', textAlign: 'left' }}>
              Quick Select Topics:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_TOPICS.map((topic) => {
                const isActive = activeTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTagToggle(topic)}
                    style={{
                      background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border-light)',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.8rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isActive ? `✓ ${topic}` : `+ ${topic}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hours-input">Available Hours Today:</label>
            <input
              id="hours-input"
              type="number"
              min={1}
              max={16}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </div>

          {error && <p style={{ color: 'var(--accent-coral)', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'left' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Analyzing & Scheduling...' : 'Generate Today\'s Agenda'}
          </button>
        </form>
      </div>

      {/* Generated Schedule / Display Panel */}
      <div className="glow-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', textAlign: 'left' }}>
          Today's Interactive Agenda
        </h2>

        {!schedule ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            border: '1px dashed var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)'
          }}>
            <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>No agenda generated</p>
            <p style={{ fontSize: '0.85rem', textAlign: 'center' }}>
              Select focus areas and set your available hours to generate a custom step-by-step study schedule.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Progress Header */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress ({completedCount}/{totalCount} tasks)</span>
                <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{completionPercent}% Done</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${completionPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                  transition: 'width 0.4s ease-out'
                }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                ⏱️ Total time committed: <strong>{schedule.total_minutes} minutes</strong> ({Math.round(schedule.total_minutes / 60 * 10) / 10} hours)
              </p>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {schedule.activities.map((a, idx) => (
                <div
                  key={idx}
                  className={`checklist-item ${completedItems[idx] ? 'completed' : ''}`}
                  onClick={() => toggleComplete(idx)}
                >
                  <div className="checklist-checkbox">
                    <svg viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="checklist-text">
                    {a.title}
                  </span>
                  <span className="checklist-duration">
                    {a.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'auto' }}>
              💡 Toggle checkmarks as you progress through each learning block.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleForm;
