import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Target, TrendingUp, MessageSquare, BarChart2 } from 'lucide-react';
import { fetchProgress } from '../api';
import { translations } from '../translations';
import '../index.css';

const Progress = ({ studentName, language }) => {
  const t = translations[language] || translations['English'];
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await fetchProgress(studentName);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, [studentName]);

  if (loading) {
    return <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{t.loading}</div>;
  }

  if (!stats || !stats.topic_stats || stats.topic_stats.length === 0) {
    return (
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
        <Target size={64} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>{t.noDataYet}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>{t.startChatting}</p>
      </div>
    );
  }

  const chartData = stats.topic_stats.map(ts => ({
    name: ts.topic.replace('_', ' ').substring(0, 15) + '...',
    count: ts.count,
    fullTopic: ts.topic.replace('_', ' ')
  }));

  const weaknesses = stats.topic_stats.slice(0, 3); // top 3 are weaknesses

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem', overflowY: 'auto', paddingRight: '1rem' }}>
      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BarChart2 size={28} color="var(--accent-purple)" />
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t.progressDashboard}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.trackGrowth}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Total Interactions */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <MessageSquare size={32} color="var(--accent-cyan)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Interactions</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.message_count}</h3>
          </div>
        </div>

        {/* Top Weakness */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(248, 81, 73, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <AlertCircle size={32} color="var(--error)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Primary Weakness</p>
            <h3 style={{ fontSize: '1.2rem', margin: 0, textTransform: 'capitalize' }}>{weaknesses[0]?.topic.replace('_', ' ')}</h3>
          </div>
        </div>

        {/* Topics Discussed */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(157, 78, 221, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <TrendingUp size={32} color="var(--accent-purple)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Topics Covered</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.topic_stats.length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flex: 1 }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Frequency of Weak Topics (Counts)</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} angle={-45} textAnchor="end" />
                <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--error)' : 'var(--accent-purple)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Areas to Improve</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {weaknesses.map((w, idx) => (
              <li key={idx} style={{
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: '8px',
                borderLeft: `4px solid ${idx === 0 ? 'var(--error)' : 'var(--accent-purple)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{w.topic.replace('_', ' ')}</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {w.count} errors
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Progress;
