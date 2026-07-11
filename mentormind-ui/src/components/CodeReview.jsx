import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code } from 'lucide-react';
import { chatWithMentor } from '../api';
import { translations } from '../translations';
import '../index.css';

const renderMessage = (text) => {
  if (!text) return null;
  
  // Regex to match Markdown links OR raw HTTP/HTTPS URLs
  const regex = /(\[.*?\]\(.*?\)|\bhttps?:\/\/[^\s<]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (!part) return null;
    
    // Check if it's a Markdown link
    const mdMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (mdMatch) {
      return <a key={i} href={mdMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline', fontWeight: 'bold' }}>{mdMatch[1]}</a>;
    }
    
    // Check if it's a raw URL
    const urlMatch = part.match(/^(https?:\/\/[^\s<]+)$/);
    if (urlMatch) {
      return <a key={i} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>{urlMatch[1]}</a>;
    }
    
    return <span key={i}>{part}</span>;
  });
};

const CodeReview = ({ studentName, language }) => {
  const t = translations[language] || translations['English'];

  const [messages, setMessages] = useState([
    { role: 'assistant', content: `${t.welcome} ${studentName}! ${t.welcomeCode}` }
  ]);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !code.trim()) || isLoading) return;

    const userMessageContent = input.trim() || "Please review my code.";
    const userMessage = { role: 'user', content: userMessageContent };
    
    // Display code in the UI chat
    const displayContent = code.trim() ? `${userMessageContent}\n\nCode Submitted:\n\`\`\`\n${code}\n\`\`\`` : userMessageContent;
    
    const displayMessage = { role: 'user', content: displayContent };
    
    const newMessages = [...messages, displayMessage];
    setMessages(newMessages);
    
    const submittedCode = code;
    setInput('');
    setCode('');
    setIsLoading(true);

    try {
      // Send the actual conversation history (for backend, we just send standard messages format)
      // Since backend ask_question appends code_snippet, we pass the userMessage without code appended
      const apiMessages = [...messages.slice(0, -1), userMessage]; // replacing display message with simple one
      
      const response = await chatWithMentor(studentName, apiMessages, 'CodeReview', language, submittedCode);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.answer,
        topic: response.topic 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: t.errorServer }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Code size={28} color="var(--accent-purple)" />
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{t.codeSubmission}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.socraticGuidance}</p>
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
                <pre style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {renderMessage(msg.content)}
                </pre>
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
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{t.reviewingCode}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea
          className="input-glass"
          placeholder={t.pasteCode}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          style={{ padding: '1rem', height: '100px', resize: 'vertical', fontFamily: 'monospace' }}
        />
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="input-glass"
            placeholder={t.askQuestionOptional}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{ padding: '1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', borderRadius: '12px', gap: '0.5rem' }}>
            <Send size={20} />
            {t.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CodeReview;
