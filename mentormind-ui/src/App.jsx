import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Progress from './components/Progress';
import Quiz from './components/Quiz';
import Leaderboard from './components/Leaderboard';
import CodeReview from './components/CodeReview';
import './index.css';

function App() {
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('mentormind_student_name') || '';
  });
  
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'progress', 'quiz', 'leaderboard', 'codereview'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('mentormind_language') || 'English';
  });

  useEffect(() => {
    if (studentName) {
      localStorage.setItem('mentormind_student_name', studentName);
    } else {
      localStorage.removeItem('mentormind_student_name');
    }
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('mentormind_language', language);
  }, [language]);

  const handleLogout = () => {
    setStudentName('');
    setActiveTab('chat');
  };

  if (!studentName) {
    return <LoginScreen onLogin={setStudentName} language={language} setLanguage={setLanguage} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat studentName={studentName} language={language} />;
      case 'progress':
        return <Progress studentName={studentName} language={language} />;
      case 'quiz':
        return <Quiz studentName={studentName} language={language} />;
      case 'leaderboard':
        return <Leaderboard studentName={studentName} language={language} />;
      case 'codereview':
        return <CodeReview studentName={studentName} language={language} />;
      default:
        return <Chat studentName={studentName} language={language} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        studentName={studentName} 
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;