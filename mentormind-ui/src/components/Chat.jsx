import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2 } from 'lucide-react';
import { chatWithMentor, resetSession } from '../api';
import '../index.css';

const Chat = ({ studentName }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${studentName}! I'm MentorMind, your AI DSA Mentor. What algorithm or data structure would you like to master today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [learningMode, setLearningMode] = useState('Beginner');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // we only send the conversation history to the backend (or let it manage it? The API asks for messages)
      const response = await chatWithMentor(studentName, newMessages, learningMode);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer,
        topic: response.topic 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Something went wrong communicating with the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if(window.confirm('Are you sure you want to clear your chat history and progress?')) {
      await resetSession(studentName);
      setMessages([{ role: 'assistant', content: `Session reset! Let's start fresh, ${studentName}. What's next?` }]);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mentorship Session</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time RAG-powered guidance</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={learningMode} 
            onChange={(e) => setLearningMode(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-highlight)', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="Beginner">Beginner Mode</option>
            <option value="Intermediate">Intermediate Mode</option>
            <option value="Advanced">Advanced Mode</option>
          </select>
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '0.5rem 1rem', color: 'var(--error)' }} title="Reset Session">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg, idx) => {
          const isBot = msg.role === 'assistant';
          return (
            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexDirection: isBot ? 'row' : 'row-reverse' }}>
              <div style={{ 
                minWidth: '40px', height: '40px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isBot ? 'rgba(157, 78, 221, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                border: `1px solid ${isBot ? 'var(--accent-purple)' : 'var(--accent-cyan)'}`
              }}>
                {isBot ? <Bot size={20} color="var(--accent-purple)" /> : <User size={20} color="var(--accent-cyan)" />}
              </div>
              <div style={{ 
                maxWidth: '75%', 
                padding: '1rem', 
                borderRadius: '12px',
                background: isBot ? 'var(--bg-tertiary)' : 'rgba(0, 240, 255, 0.1)',
                border: `1px solid ${isBot ? 'var(--border-color)' : 'rgba(0, 240, 255, 0.2)'}`,
                borderTopLeftRadius: isBot ? 0 : '12px',
                borderTopRightRadius: isBot ? '12px' : 0,
              }}>
                <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                {msg.topic && (
                  <div style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    Topic: {msg.topic.replace('_', ' ')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {isLoading && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(157, 78, 221, 0.2)', border: '1px solid var(--accent-purple)' }}>
              <Bot size={20} color="var(--accent-purple)" />
            </div>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderTopLeftRadius: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>MentorMind is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="input-glass"
            placeholder="Type your answer or question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ padding: '1.25rem 1.5rem' }}
          />
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', borderRadius: '12px' }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
