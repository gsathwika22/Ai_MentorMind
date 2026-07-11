import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { fetchLeaderboard } from '../api';
import { translations } from '../translations';
import '../index.css';

const Leaderboard = ({ studentName, language }) => {
  const t = translations[language] || translations['English'];

  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        setLeaders(data.leaderboard || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-panel animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Trophy size={32} color="var(--accent-cyan)" />
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{t.globalLeaderboard}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{t.topStudents}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {leaders.map((student, index) => {
          const isCurrentUser = student.name === studentName;
          
          let RankIcon = Star;
          let iconColor = 'var(--text-secondary)';
          if (index === 0) { RankIcon = Trophy; iconColor = '#FFD700'; } // Gold
          else if (index === 1) { RankIcon = Medal; iconColor = '#C0C0C0'; } // Silver
          else if (index === 2) { RankIcon = Medal; iconColor = '#CD7F32'; } // Bronze

          return (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: '12px',
                background: isCurrentUser ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-tertiary)',
                border: isCurrentUser ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: '30px', display: 'flex', justifyContent: 'center' }}>
                  <RankIcon size={24} color={iconColor} />
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: isCurrentUser ? 'bold' : 'normal', color: 'var(--text-primary)' }}>
                  {index + 1}. {student.name} {isCurrentUser && t.you}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>
                {student.points} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{t.pts}</span>
              </div>
            </div>
          );
        })}
        {leaders.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{t.noStudents}</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
