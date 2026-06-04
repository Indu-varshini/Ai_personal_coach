// src/App.tsx
import React, { useState, useEffect } from 'react';
import ScheduleForm from './components/ScheduleForm';
import HabitTracker from './components/HabitTracker';
import InterviewPrep from './components/InterviewPrep';
import CodePractice from './components/CodePractice';

type Tab = 'schedule' | 'habits' | 'interview' | 'code';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [greeting, setGreeting] = useState<string>('Connecting with AI Coach...');
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // Fetch coach status/greeting from backend root
  useEffect(() => {
    const checkServer = async () => {
      try {
        const resp = await fetch('/api/');
        if (resp.ok) {
          const data = await resp.json();
          setGreeting(data.message || 'Hello, I am your AI Coach!');
          setIsOnline(true);
        } else {
          setGreeting('AI Coach offline');
          setIsOnline(false);
        }
      } catch (e) {
        console.error(e);
        setGreeting('Could not connect to Coach server.');
        setIsOnline(false);
      }
    };
    checkServer();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'schedule':
        return <ScheduleForm />;
      case 'habits':
        return <HabitTracker />;
      case 'interview':
        return <InterviewPrep />;
      case 'code':
        return <CodePractice />;
      default:
        return <ScheduleForm />;
    }
  };

  const getTabTitleAndSubtitle = () => {
    switch (activeTab) {
      case 'schedule':
        return {
          title: 'Daily Study Agenda',
          subtitle: 'Plan your learning sessions and monitor completion progress.'
        };
      case 'habits':
        return {
          title: 'Habit Tracker',
          subtitle: 'Log continuous practice to build streaks and review stats.'
        };
      case 'interview':
        return {
          title: 'Interview Preparation',
          subtitle: 'Prepare with random technical questions and record notes.'
        };
      case 'code':
        return {
          title: 'Code Assessment',
          subtitle: 'Write code snippets and receive instant feedback scores.'
        };
    }
  };

  const { title, subtitle } = getTabTitleAndSubtitle();

  return (
    <div className="dashboard-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">C</div>
            <span className="brand-name">Coach AI</span>
          </div>

          <nav>
            <ul className="nav-links">
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`nav-button ${activeTab === 'schedule' ? 'active' : ''}`}
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Daily Agenda
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab('habits')}
                  className={`nav-button ${activeTab === 'habits' ? 'active' : ''}`}
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Habit Tracker
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`nav-button ${activeTab === 'interview' ? 'active' : ''}`}
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Interview Prep
                </button>
              </li>
              <li className="nav-item">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`nav-button ${activeTab === 'code' ? 'active' : ''}`}
                >
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  Code Assessment
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>Version 1.0.0</div>
          <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Empowered by FastAPI & React
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="workspace">
        {/* Workspace Header */}
        <header className="workspace-header">
          <div className="workspace-title">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          
          {/* Status greeting widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-light)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            maxWidth: '300px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--secondary)' : 'var(--accent-coral)',
              boxShadow: isOnline ? '0 0 8px var(--secondary)' : '0 0 8px var(--accent-coral)',
              display: 'inline-block',
              flexShrink: 0
            }} />
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {greeting}
            </span>
          </div>
        </header>

        {/* Tab view rendering */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
};

export default App;
