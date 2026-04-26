import React from 'react';
import { MessageSquare, BarChart2, CheckSquare, LogOut, Bot } from 'lucide-react';
import '../index.css';

const Sidebar = ({ activeTab, setActiveTab, studentName, onLogout }) => {
  const tabs = [
    { id: 'chat', label: 'Mentorship Chat', icon: MessageSquare },
    { id: 'progress', label: 'Progress & Weaknesses', icon: BarChart2 },
    { id: 'quiz', label: 'Quizzes & Marks', icon: CheckSquare },
  ];

  return (
    <div className="glass-panel" style={{
      width: '280px',
      height: 'calc(100vh - 2rem)',
      margin: '1rem',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      borderRight: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <Bot size={32} color="var(--accent-cyan)" />
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
          Mentor<span className="text-gradient">Mind</span>
        </h2>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Student Profile
        </p>
        <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{studentName}</h3>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                borderRadius: '8px',
                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                border: isActive ? '1px solid var(--border-highlight)' : '1px solid transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontFamily: 'Inter',
                fontWeight: isActive ? 600 : 500,
                fontSize: '1rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onLogout}
        className="btn-secondary"
        style={{ marginTop: 'auto', justifyContent: 'center' }}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
