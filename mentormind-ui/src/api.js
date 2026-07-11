const API_BASE = 'http://127.0.0.1:8000';

export const chatWithMentor = async (studentName, messages, learningMode = 'Beginner', language = 'English', codeSnippet = null) => {
  const response = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ student_name: studentName, messages, learning_mode: learningMode, language, code_snippet: codeSnippet }),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

export const fetchProgress = async (studentName) => {
  const response = await fetch(`${API_BASE}/progress/${studentName}`);
  if (!response.ok) throw new Error('Failed to fetch progress');
  return response.json();
};

export const fetchQuiz = async (studentName) => {
  const response = await fetch(`${API_BASE}/quiz/${studentName}`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch quiz');
  }
  return response.json();
};

export const resetSession = async (studentName) => {
  const response = await fetch(`${API_BASE}/reset/${studentName}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to reset session');
  return response.json();
};

export const fetchLeaderboard = async () => {
  const response = await fetch(`${API_BASE}/leaderboard`);
  if (!response.ok) throw new Error('Failed to fetch leaderboard');
  return response.json();
};
