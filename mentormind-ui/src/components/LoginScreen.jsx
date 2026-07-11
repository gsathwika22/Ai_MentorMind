import React, { useState } from 'react';
import { Bot, ChevronRight, Lock, User, Loader2 } from 'lucide-react';
import '../index.css';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && password.trim()) {
      setIsLoggingIn(true);
      // Simulate network request
      setTimeout(() => {
        onLogin(name.trim());
      }, 1500);
    }
  };

  return (
    <div className="app-container login-bg">
      <div className="glass-panel animate-fade-in login-card" style={{ padding: '3rem', maxWidth: '450px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative elements */}
        <div className="glow-orb" style={{ top: '-50px', left: '-50px', background: 'rgba(0, 240, 255, 0.2)' }}></div>
        <div className="glow-orb" style={{ bottom: '-50px', right: '-50px', background: 'rgba(157, 78, 221, 0.2)' }}></div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'var(--accent-gradient)', padding: '1rem', borderRadius: '24px', boxShadow: '0 8px 32px rgba(157, 78, 221, 0.4)' }}>
            <Bot size={48} color="white" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
          Mentor<span className="text-gradient">Mind</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', position: 'relative', zIndex: 1 }}>
          Unlock your AI DSA learning journey.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div className="input-wrapper">
            <User size={20} className="input-icon" />
            <input
              type="text"
              className="input-glass with-icon"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              disabled={isLoggingIn}
            />
          </div>
          <div className="input-wrapper">
            <Lock size={20} className="input-icon" />
            <input
              type="password"
              className="input-glass with-icon"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoggingIn}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem', marginTop: '1rem', height: '56px' }}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="spinner" size={24} />
            ) : (
              <>Start Learning <ChevronRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
