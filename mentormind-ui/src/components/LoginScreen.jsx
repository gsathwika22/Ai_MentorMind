import React, { useState } from 'react';
import { Bot, ChevronRight } from 'lucide-react';
import './index.css';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '1rem', borderRadius: '50%' }}>
            <Bot size={48} color="white" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Mentor<span className="text-gradient">Mind</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Your AI DSA Mentor. Let's master algorithms together.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            className="input-glass"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
            Start Learning <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
