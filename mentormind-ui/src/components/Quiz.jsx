import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { fetchQuiz } from '../api';
import '../index.css';

const Quiz = ({ studentName }) => {
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    setIsFinished(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);

    try {
      const data = await fetchQuiz(studentName);
      // The API returns { topic, difficulty, quiz: "stringified JSON" }
      let parsedQuiz = [];
      try {
        parsedQuiz = JSON.parse(data.quiz);
      } catch (e) {
        parsedQuiz = [];
      }
      setQuizData({ ...data, questions: parsedQuiz });
    } catch (err) {
      setError(err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex, questionIndex) => {
    if (selectedAnswers[questionIndex] !== undefined) return; // already answered
    
    const isCorrect = optionIndex === getCorrectOptionIndex(quizData.questions[questionIndex].answer);
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const getCorrectOptionIndex = (answerStr) => {
    // "A", "B", "C", "D"
    return answerStr.charCodeAt(0) - 65;
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("MentorMind Quiz Report", 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Student: ${studentName}`, 20, 30);
    doc.text(`Topic: ${quizData.topic.replace('_', ' ').toUpperCase()}`, 20, 40);
    doc.text(`Difficulty: ${quizData.difficulty}`, 20, 50);
    doc.text(`Final Score: ${score} / ${quizData.questions.length}`, 20, 60);

    doc.line(20, 65, 190, 65);

    let y = 75;
    quizData.questions.forEach((q, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(12);
      doc.text(`Q${i + 1}: ${q.question}`, 20, y, { maxWidth: 170 });
      y += 10;
      
      const isCorrect = selectedAnswers[i] === getCorrectOptionIndex(q.answer);
      const userAnswerText = q.options[selectedAnswers[i]] || "Not answered";
      
      doc.setFontSize(10);
      doc.text(`Your Answer: ${userAnswerText} ${isCorrect ? '(Correct)' : '(Incorrect)'}`, 20, y, { maxWidth: 170 });
      y += 7;
      
      if (!isCorrect) {
        doc.text(`Correct Answer: ${q.options[getCorrectOptionIndex(q.answer)]}`, 20, y, { maxWidth: 170 });
        y += 7;
      }

      doc.text(`Explanation: ${q.explanation}`, 20, y, { maxWidth: 170 });
      y += 15;
    });

    doc.save(`${studentName}_MentorMind_Report.pdf`);
  };

  if (!quizData && !loading) {
    return (
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '2rem' }}>
        <CheckSquareIcon size={64} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1rem' }}>Ready to Test Your Skills?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '2rem' }}>
          Take a dynamically generated quiz targeting your weakest topics to improve your DSA knowledge.
        </p>
        <button onClick={handleStartQuiz} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <RefreshCw size={18} /> Generate Quiz
        </button>
        {error && <p style={{ color: 'var(--error)', marginTop: '1rem' }}>{error}</p>}
      </div>
    );
  }

  if (loading) {
    return <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Generating your personalized quiz...</div>;
  }

  if (isFinished) {
    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem', border: '4px solid var(--accent-cyan)' }}>
          <h1 style={{ fontSize: '4rem', margin: 0, color: 'var(--accent-cyan)' }}>{score}/{quizData.questions.length}</h1>
        </div>
        <h2 style={{ marginBottom: '1rem' }}>Quiz Completed!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You just completed a {quizData.difficulty} level quiz on <strong>{quizData.topic.replace('_', ' ')}</strong>.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadReport} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={18} /> Download Report
          </button>
          <button onClick={handleStartQuiz} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RefreshCw size={18} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quizData.questions[currentQuestionIndex];
  const answered = selectedAnswers[currentQuestionIndex] !== undefined;
  const isCorrect = answered && selectedAnswers[currentQuestionIndex] === getCorrectOptionIndex(currentQ.answer);

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', textTransform: 'capitalize' }}>{quizData.topic.replace('_', ' ')} Quiz</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Difficulty: {quizData.difficulty}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
          Question {currentQuestionIndex + 1} of {quizData.questions.length}
        </div>
      </div>

      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1.25rem', lineHeight: 1.6, marginBottom: '2rem' }}>{currentQ.question}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            const correctOptionIdx = getCorrectOptionIndex(currentQ.answer);
            
            let bg = 'var(--bg-tertiary)';
            let border = 'var(--border-color)';
            
            if (answered) {
              if (idx === correctOptionIdx) {
                bg = 'rgba(46, 160, 67, 0.15)';
                border = 'var(--success)';
              } else if (isSelected) {
                bg = 'rgba(248, 81, 73, 0.15)';
                border = 'var(--error)';
              }
            } else if (isSelected) {
              bg = 'rgba(0, 240, 255, 0.1)';
              border = 'var(--accent-cyan)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx, currentQuestionIndex)}
                disabled={answered}
                style={{
                  textAlign: 'left',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: bg,
                  border: `1px solid ${border}`,
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => {
                  if (!answered) e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                }}
                onMouseLeave={(e) => {
                  if (!answered) e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {option}
                {answered && idx === correctOptionIdx && <CheckCircle size={24} color="var(--success)" />}
                {answered && isSelected && idx !== correctOptionIdx && <XCircle size={24} color="var(--error)" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}` }}>
            <h4 style={{ color: isCorrect ? 'var(--success)' : 'var(--error)', marginBottom: '0.5rem' }}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h4>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.5 }}>{currentQ.explanation}</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleNext} className="btn-primary">
                {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper icon component since CheckSquare from lucide-react was conflicting or not available directly as a large icon in my thought.
const CheckSquareIcon = ({ size, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

export default Quiz;
