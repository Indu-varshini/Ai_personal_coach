import React, { useState } from 'react';

const CoachGreeting: React.FC = () => {
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const fetchGreeting = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/');
      const data = await resp.json();
      setGreeting(data.message || 'No message');
    } catch (e) {
      console.error(e);
      setGreeting('Error fetching greeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coach-greeting">
      <button onClick={fetchGreeting} disabled={loading}>
        {loading ? 'Loading…' : 'Get Greeting'}
      </button>
      {greeting && <p>{greeting}</p>}
    </div>
  );
};

export default CoachGreeting;
