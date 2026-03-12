import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitResult } from '../../services/api';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuiz(quizId)
      .then(res => setQuiz(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSelect = (optionIndex) => {
    setAnswers(prev => ({ ...prev, [currentQ]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((_, idx) => ({
        selectedAnswer: answers[idx] !== undefined ? answers[idx] : -1
      }));
      const res = await submitResult({ quizId, answers: formattedAnswers });
      navigate(`/results/${res.data._id}`);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading quiz...</p></div>;
  }

  if (!quiz) {
    return <div className="page-container"><div className="empty-state"><h3>Quiz not found</h3></div></div>;
  }

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every((_, idx) => answers[idx] !== undefined);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="page-container">
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>📝 {quiz.title}</h2>
          <div className="quiz-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{currentQ + 1} / {quiz.questions.length}</span>
          </div>
        </div>

        <div className="quiz-question-card">
          <div className="question-number">Question {currentQ + 1}</div>
          <div className="question-text">{question.question}</div>
          <div className="options-list">
            {question.options.map((option, idx) => (
              <div
                key={idx}
                className={`option-item ${answers[currentQ] === idx ? 'selected' : ''}`}
                onClick={() => handleSelect(idx)}
              >
                <span className="option-letter">{letters[idx]}</span>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="quiz-actions">
          <button
            className="btn btn-outline"
            onClick={() => setCurrentQ(prev => prev - 1)}
            disabled={currentQ === 0}
          >
            <FiArrowLeft /> Previous
          </button>

          {currentQ < quiz.questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => setCurrentQ(prev => prev + 1)}
              disabled={answers[currentQ] === undefined}
            >
              Next <FiArrowRight />
            </button>
          ) : (
            <button
              className="btn btn-success btn-lg"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              <FiCheck /> {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {quiz.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQ(idx)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: currentQ === idx ? '2px solid var(--primary)' : '2px solid var(--border)',
                background: answers[idx] !== undefined
                  ? (currentQ === idx ? 'var(--primary)' : 'var(--primary-light)')
                  : 'var(--bg-card)',
                color: currentQ === idx && answers[idx] !== undefined ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                transition: 'var(--transition)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
