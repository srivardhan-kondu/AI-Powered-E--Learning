import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getAIFeedback } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiBookOpen, FiAward, FiTarget, FiTrendingUp, FiCpu, FiAlertTriangle } from 'react-icons/fi';

const COLORS = ['#2ABFBF', '#7C6FE0', '#FF8474', '#4CAF50', '#FFB74D'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGetFeedback = async () => {
    setAiLoading(true);
    try {
      const res = await getAIFeedback();
      setAiFeedback(res.data);
    } catch (error) {
      console.error('AI Feedback error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div><p className="loading-text">Loading dashboard...</p></div>;
  }

  if (!data) {
    return <div className="page-container"><div className="empty-state"><h3>Could not load dashboard</h3></div></div>;
  }

  const scoreClass = (pct) => pct >= 80 ? 'score-high' : pct >= 50 ? 'score-medium' : 'score-low';

  const pieData = data.courseStats?.map(cs => ({
    name: cs.course,
    value: cs.quizzesAttempted
  })) || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 Learning Dashboard</h1>
        <p>Track your progress and performance across all courses</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon primary"><FiBookOpen /></div>
          <div className="stat-info">
            <h3>{data.enrolledCourses}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon secondary"><FiTarget /></div>
          <div className="stat-info">
            <h3>{data.totalQuizzes}</h3>
            <p>Quizzes Attempted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent"><FiAward /></div>
          <div className="stat-info">
            <h3>{data.averageScore}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FiTrendingUp /></div>
          <div className="stat-info">
            <h3>{data.weakTopics?.length || 0}</h3>
            <p>Areas to Improve</p>
          </div>
        </div>
      </div>

      {/* AI Feedback Button */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleGetFeedback}
          disabled={aiLoading || data.totalQuizzes === 0}
        >
          <FiCpu /> {aiLoading ? 'Generating AI Insights...' : 'Get Personalized AI Feedback'}
        </button>
      </div>

      {/* AI Feedback Card */}
      {aiLoading && (
        <div className="ai-feedback-card">
          <div className="loading-container" style={{ padding: '2rem' }}>
            <div className="spinner"></div>
            <p className="loading-text">AI is analyzing your learning patterns...</p>
          </div>
        </div>
      )}

      {aiFeedback && (
        <div className="ai-feedback-card">
          <div className="ai-feedback-header">
            <span className="ai-badge"><FiCpu /> AI Learning Advisor</span>
          </div>
          <div className="ai-feedback-content">
            <p>{aiFeedback.feedback}</p>

            {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
              <div className="ai-section">
                <h4>💪 Your Strengths</h4>
                <ul className="ai-list">
                  {aiFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {aiFeedback.improvements && aiFeedback.improvements.length > 0 && (
              <div className="ai-section">
                <h4>📈 Areas for Improvement</h4>
                <ul className="ai-list">
                  {aiFeedback.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {aiFeedback.studyPlan && aiFeedback.studyPlan.length > 0 && (
              <div className="ai-section">
                <h4>📋 Personalized Study Plan</h4>
                <ul className="ai-list">
                  {aiFeedback.studyPlan.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Recent Results */}
        <div className="dashboard-card">
          <h3><FiTarget /> Recent Quiz Results</h3>
          {data.recentResults?.length > 0 ? (
            data.recentResults.map((r, idx) => (
              <div
                key={idx}
                className="recent-item"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/results/${r.id}`)}
              >
                <div className="recent-item-info">
                  <h4>{r.quizTitle}</h4>
                  <p>{r.courseTitle} • {new Date(r.completedAt).toLocaleDateString()}</p>
                </div>
                <span className={`recent-item-score ${scoreClass(r.percentage)}`}>
                  {r.percentage}%
                </span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No quizzes taken yet. Start a course to begin!</p>
            </div>
          )}
        </div>

        {/* Weak Topics */}
        <div className="dashboard-card">
          <h3><FiAlertTriangle /> Areas to Improve</h3>
          {data.weakTopics?.length > 0 ? (
            data.weakTopics.map((w, idx) => (
              <div key={idx} className="weak-topic-item">
                <span className="topic-name">{w.topic}</span>
                <span className="topic-score">{w.averageScore}%</span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">🎉</div>
              <p>{data.totalQuizzes > 0 ? 'Great job! No weak areas found!' : 'Take quizzes to see analytics'}</p>
            </div>
          )}
        </div>

        {/* Course Performance Chart */}
        <div className="dashboard-card">
          <h3><FiTrendingUp /> Course Performance</h3>
          {data.courseStats?.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.courseStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                  <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#2ABFBF" radius={[6, 6, 0, 0]} name="Avg Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Complete quizzes to see performance charts</p>
            </div>
          )}
        </div>

        {/* Quiz Distribution */}
        <div className="dashboard-card">
          <h3><FiAward /> Quiz Distribution</h3>
          {pieData.length > 0 ? (
            <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name.split(' ')[0]} (${value})`}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Complete quizzes to see distribution</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
