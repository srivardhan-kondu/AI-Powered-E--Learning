import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResult, getQuizFull, getAIExplanation } from '../../services/api';
import { FiArrowLeft, FiRefreshCw, FiBookOpen, FiCpu } from 'react-icons/fi';

const QuizResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    getResult(resultId)
      .then(async (res) => {
        setResult(res.data);
        const quizRes = await getQuizFull(res.data.quiz._id || res.data.quiz);
        setQuiz(quizRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resultId]);

  const handleGetAI = async () => {
    setAiLoading(true);
    try {
      const res = await getAIExplanation(resultId);
      setAiData(res.data);
    } catch (error) {
      console.error('AI error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading results...</p></div>;
  }

  if (!result) {
    return <div className="page-container"><div className="empty-state"><h3>Result not found</h3></div></div>;
  }

  const scoreClass = result.percentage >= 80 ? 'excellent' : result.percentage >= 60 ? 'good' : result.percentage >= 40 ? 'average' : 'poor';
  const getMessage = () => {
    if (result.percentage >= 90) return '🎉 Outstanding! You aced it!';
    if (result.percentage >= 80) return '🌟 Great job! Well done!';
    if (result.percentage >= 60) return '👍 Good effort! Keep learning!';
    if (result.percentage >= 40) return '📖 Review the material and try again';
    return '💪 Don\'t give up! Study and retry';
  };

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="result-card">
        <div className={`result-score-circle ${scoreClass}`}>
          {result.percentage}%
          <span className="score-label">{scoreClass}</span>
        </div>
        <h2 className="result-message">{getMessage()}</h2>
        <p className="result-details">
          You scored {result.score} out of {result.totalQuestions} questions correctly
          {result.course?.title && ` in ${result.course.title}`}
        </p>

        <div className="result-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Go Back
          </button>
          <button className="btn btn-secondary" onClick={() => setShowReview(!showReview)}>
            <FiBookOpen /> {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          {result.percentage < 100 && (
            <button
              className="btn btn-primary"
              onClick={handleGetAI}
              disabled={aiLoading}
            >
              <FiCpu /> {aiLoading ? 'Getting AI Feedback...' : 'Get AI Explanation'}
            </button>
          )}
          <button className="btn btn-outline" onClick={() => navigate(`/quiz/${result.quiz._id || result.quiz}`)}>
            <FiRefreshCw /> Retry Quiz
          </button>
        </div>
      </div>

      {/* AI Feedback */}
      {aiLoading && (
        <div className="ai-feedback-card">
          <div className="ai-feedback-header">
            <span className="ai-badge"><FiCpu /> AI Tutor</span>
          </div>
          <div className="loading-container" style={{ padding: '2rem' }}>
            <div className="spinner"></div>
            <p className="loading-text">Analyzing your answers with AI...</p>
          </div>
        </div>
      )}

      {aiData && (
        <div className="ai-feedback-card">
          <div className="ai-feedback-header">
            <span className="ai-badge"><FiCpu /> AI Tutor</span>
            <h3>Personalized Feedback</h3>
          </div>

          <div className="ai-feedback-content">
            {Array.isArray(aiData.explanations) ? (
              aiData.explanations.map((exp, idx) => (
                <div key={idx} className="explanation-card">
                  <div className="question-label">Question {idx + 1}</div>
                  <div className="question-text" style={{ fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                    {exp.question}
                  </div>
                  <div className="explanation-text">{exp.explanation}</div>
                </div>
              ))
            ) : (
              <p>{typeof aiData.explanations === 'string' ? aiData.explanations : JSON.stringify(aiData.explanations)}</p>
            )}

            {aiData.recommendations && aiData.recommendations.length > 0 && (
              <div className="ai-section">
                <h4>📝 Study Recommendations</h4>
                <ul className="ai-list">
                  {aiData.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Answer Review */}
      {showReview && quiz && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📋 Answer Review</h3>
          {quiz.questions.map((question, idx) => {
            const answer = result.answers[idx];
            return (
              <div key={idx} className="quiz-question-card">
                <div className="question-number">Question {idx + 1}</div>
                <div className="question-text">{question.question}</div>
                <div className="options-list">
                  {question.options.map((option, oIdx) => {
                    let className = 'option-item';
                    if (oIdx === question.correctAnswer) className += ' correct';
                    else if (answer && oIdx === answer.selectedAnswer && !answer.isCorrect) className += ' incorrect';
                    return (
                      <div key={oIdx} className={className}>
                        <span className="option-letter">{letters[oIdx]}</span>
                        <span>{option}</span>
                        {oIdx === question.correctAnswer && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--success)' }}>✓ Correct</span>}
                        {answer && oIdx === answer.selectedAnswer && !answer.isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--error)' }}>✗ Your answer</span>}
                      </div>
                    );
                  })}
                </div>
                {question.explanation && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    💡 {question.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizResult;
