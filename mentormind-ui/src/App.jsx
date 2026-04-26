import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Progress from './components/Progress';
import Quiz from './components/Quiz';
import './index.css';

function App() {
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('mentormind_student_name') || '';
  });
  
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'progress', 'quiz'

  useEffect(() => {
    if (studentName) {
      localStorage.setItem('mentormind_student_name', studentName);
    } else {
      localStorage.removeItem('mentormind_student_name');
    }
  }, [studentName]);

  const handleLogout = () => {
    setStudentName('');
    setActiveTab('chat');
  };

  if (!studentName) {
    return <LoginScreen onLogin={setStudentName} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <Chat studentName={studentName} />;
      case 'progress':
        return <Progress studentName={studentName} />;
      case 'quiz':
        return <Quiz studentName={studentName} />;
      default:
        return <Chat studentName={studentName} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        studentName={studentName} 
        onLogout={handleLogout} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;