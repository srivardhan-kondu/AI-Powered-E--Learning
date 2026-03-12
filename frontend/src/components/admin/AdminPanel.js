import React, { useState, useEffect } from 'react';
import { FiUsers, FiBookOpen, FiFileText, FiAward, FiTrash2, FiTrendingUp, FiPlus, FiPlusCircle, FiX } from 'react-icons/fi';
import API from '../../services/api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Course form state
  const [newCourse, setNewCourse] = useState({
    title: '', description: '', category: '', thumbnail: '', difficulty: 'Beginner',
    topics: [{ title: '', description: '', subtopics: [{ title: '', content: '', order: 0 }], order: 0 }]
  });

  // Add Quiz form state
  const [newQuiz, setNewQuiz] = useState({
    course: '', topicIndex: 0, subtopicIndex: 0, title: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, coursesRes, quizzesRes, resultsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/courses'),
        API.get('/admin/quizzes'),
        API.get('/admin/results')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
      setQuizzes(quizzesRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will also remove their results.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleDeleteCourse = async (id, title) => {
    if (!window.confirm(`Delete course "${title}"? This will also remove related quizzes and results.`)) return;
    try {
      await API.delete(`/admin/courses/${id}`);
      setCourses(courses.filter(c => c._id !== id));
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete course.');
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Delete quiz "${title}"? This will also remove related results.`)) return;
    try {
      await API.delete(`/admin/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q._id !== id));
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete quiz.');
    }
  };

  // ── Add Course handlers ──
  const handleCourseFieldChange = (field, value) => {
    setNewCourse(prev => ({ ...prev, [field]: value }));
  };

  const handleTopicChange = (tIdx, field, value) => {
    setNewCourse(prev => {
      const topics = [...prev.topics];
      topics[tIdx] = { ...topics[tIdx], [field]: value };
      return { ...prev, topics };
    });
  };

  const handleSubtopicChange = (tIdx, sIdx, field, value) => {
    setNewCourse(prev => {
      const topics = [...prev.topics];
      const subtopics = [...topics[tIdx].subtopics];
      subtopics[sIdx] = { ...subtopics[sIdx], [field]: value };
      topics[tIdx] = { ...topics[tIdx], subtopics };
      return { ...prev, topics };
    });
  };

  const addTopic = () => {
    setNewCourse(prev => ({
      ...prev,
      topics: [...prev.topics, { title: '', description: '', subtopics: [{ title: '', content: '', order: 0 }], order: prev.topics.length }]
    }));
  };

  const removeTopic = (tIdx) => {
    setNewCourse(prev => ({ ...prev, topics: prev.topics.filter((_, i) => i !== tIdx) }));
  };

  const addSubtopic = (tIdx) => {
    setNewCourse(prev => {
      const topics = [...prev.topics];
      topics[tIdx] = {
        ...topics[tIdx],
        subtopics: [...topics[tIdx].subtopics, { title: '', content: '', order: topics[tIdx].subtopics.length }]
      };
      return { ...prev, topics };
    });
  };

  const removeSubtopic = (tIdx, sIdx) => {
    setNewCourse(prev => {
      const topics = [...prev.topics];
      topics[tIdx] = { ...topics[tIdx], subtopics: topics[tIdx].subtopics.filter((_, i) => i !== sIdx) };
      return { ...prev, topics };
    });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.description || !newCourse.category) {
      alert('Please fill in title, description and category.');
      return;
    }
    setSaving(true);
    try {
      await API.post('/courses', newCourse);
      alert('Course created successfully!');
      setNewCourse({
        title: '', description: '', category: '', thumbnail: '', difficulty: 'Beginner',
        topics: [{ title: '', description: '', subtopics: [{ title: '', content: '', order: 0 }], order: 0 }]
      });
      setShowAddCourse(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create course.');
    } finally {
      setSaving(false);
    }
  };

  // ── Add Quiz handlers ──
  const handleQuizFieldChange = (field, value) => {
    setNewQuiz(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (qIdx, field, value) => {
    setNewQuiz(prev => {
      const questions = [...prev.questions];
      questions[qIdx] = { ...questions[qIdx], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setNewQuiz(prev => {
      const questions = [...prev.questions];
      const options = [...questions[qIdx].options];
      options[oIdx] = value;
      questions[qIdx] = { ...questions[qIdx], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
    }));
  };

  const removeQuestion = (qIdx) => {
    setNewQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qIdx) }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!newQuiz.course || !newQuiz.title || newQuiz.questions.length === 0) {
      alert('Please fill in course, title and add at least one question.');
      return;
    }
    setSaving(true);
    try {
      await API.post('/quizzes', newQuiz);
      alert('Quiz created successfully!');
      setNewQuiz({
        course: '', topicIndex: 0, subtopicIndex: 0, title: '',
        questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }]
      });
      setShowAddQuiz(false);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FiTrendingUp /> },
    { key: 'users', label: 'Users', icon: <FiUsers /> },
    { key: 'courses', label: 'Courses', icon: <FiBookOpen /> },
    { key: 'quizzes', label: 'Quizzes', icon: <FiFileText /> },
    { key: 'results', label: 'Results', icon: <FiAward /> }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>⚙️ Admin Panel</h1>
        <p>Manage users, courses, quizzes, and monitor platform activity</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          <div className="dashboard-stats" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon primary"><FiUsers /></div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon secondary"><FiBookOpen /></div>
              <div className="stat-info">
                <h3>{stats.totalCourses}</h3>
                <p>Total Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon accent"><FiFileText /></div>
              <div className="stat-info">
                <h3>{stats.totalQuizzes}</h3>
                <p>Total Quizzes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><FiAward /></div>
              <div className="stat-info">
                <h3>{stats.totalResults}</h3>
                <p>Quiz Attempts</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📊 Platform Average Score</h3>
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div className={`result-score-circle ${stats.avgScore >= 80 ? 'excellent' : stats.avgScore >= 60 ? 'good' : stats.avgScore >= 40 ? 'average' : 'poor'}`}
                  style={{ margin: '0 auto' }}>
                  {stats.avgScore}%
                  <span className="score-label">Average</span>
                </div>
              </div>
            </div>
            <div className="dashboard-card">
              <h3>📈 Quick Summary</h3>
              <div style={{ padding: '1rem 0' }}>
                <div className="sidebar-stat">
                  <span className="label">Registered Users</span>
                  <span className="value">{stats.totalUsers}</span>
                </div>
                <div className="sidebar-stat">
                  <span className="label">Available Courses</span>
                  <span className="value">{stats.totalCourses}</span>
                </div>
                <div className="sidebar-stat">
                  <span className="label">Active Quizzes</span>
                  <span className="value">{stats.totalQuizzes}</span>
                </div>
                <div className="sidebar-stat">
                  <span className="label">Total Attempts</span>
                  <span className="value">{stats.totalResults}</span>
                </div>
                <div className="sidebar-stat">
                  <span className="label">Platform Avg Score</span>
                  <span className="value">{stats.avgScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3><FiUsers /> All Users ({users.length})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Enrolled Courses</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.enrolledCourses?.length || 0}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        title="Delete user"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setShowAddCourse(!showAddCourse)}>
              {showAddCourse ? <><FiX /> Cancel</> : <><FiPlus /> Add New Course</>}
            </button>
          </div>

          {showAddCourse && (
            <div className="admin-form-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>📝 Create New Course</h3>
              <form onSubmit={handleCreateCourse}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>Course Title *</label>
                    <input className="form-input" placeholder="e.g. Advanced React" value={newCourse.title}
                      onChange={e => handleCourseFieldChange('title', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input className="form-input" placeholder="e.g. Web Development" value={newCourse.category}
                      onChange={e => handleCourseFieldChange('category', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label>Description *</label>
                  <textarea className="form-input" rows="3" placeholder="Course description..." value={newCourse.description}
                    onChange={e => handleCourseFieldChange('description', e.target.value)} required
                    style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Thumbnail Emoji</label>
                    <input className="form-input" placeholder="e.g. ⚛️" value={newCourse.thumbnail}
                      onChange={e => handleCourseFieldChange('thumbnail', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select className="form-input" value={newCourse.difficulty}
                      onChange={e => handleCourseFieldChange('difficulty', e.target.value)}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📂 Topics & Subtopics
                  <button type="button" className="btn btn-sm btn-outline" onClick={addTopic}><FiPlusCircle /> Add Topic</button>
                </h4>

                {newCourse.topics.map((topic, tIdx) => (
                  <div key={tIdx} className="admin-topic-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--secondary-dark)' }}>Topic {tIdx + 1}</span>
                      {newCourse.topics.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeTopic(tIdx)}><FiTrash2 /></button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <input className="form-input" placeholder="Topic title" value={topic.title}
                        onChange={e => handleTopicChange(tIdx, 'title', e.target.value)} />
                      <input className="form-input" placeholder="Topic description" value={topic.description}
                        onChange={e => handleTopicChange(tIdx, 'description', e.target.value)} />
                    </div>

                    {topic.subtopics.map((sub, sIdx) => (
                      <div key={sIdx} className="admin-subtopic-block">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Subtopic {sIdx + 1}</span>
                          {topic.subtopics.length > 1 && (
                            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={() => removeSubtopic(tIdx, sIdx)}><FiX /></button>
                          )}
                        </div>
                        <input className="form-input" placeholder="Subtopic title" value={sub.title}
                          onChange={e => handleSubtopicChange(tIdx, sIdx, 'title', e.target.value)}
                          style={{ marginBottom: '0.5rem' }} />
                        <textarea className="form-input" rows="4" placeholder="Subtopic content (supports Markdown)" value={sub.content}
                          onChange={e => handleSubtopicChange(tIdx, sIdx, 'content', e.target.value)}
                          style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }} />
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => addSubtopic(tIdx)}
                      style={{ marginTop: '0.5rem' }}><FiPlusCircle /> Add Subtopic</button>
                  </div>
                ))}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                    {saving ? 'Creating...' : '✨ Create Course'}
                  </button>
                  <button type="button" className="btn btn-outline btn-lg" onClick={() => setShowAddCourse(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3><FiBookOpen /> All Courses ({courses.length})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Difficulty</th>
                <th>Topics</th>
                <th>Quizzes</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{course.thumbnail || '📖'}</span>
                      {course.title}
                    </div>
                  </td>
                  <td>{course.category}</td>
                  <td>
                    <span className={`course-badge badge-${course.difficulty?.toLowerCase()}`}>
                      {course.difficulty}
                    </span>
                  </td>
                  <td>{course.topics?.length || 0}</td>
                  <td>{course.quizCount}</td>
                  <td>{course.enrollCount}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCourse(course._id, course.title)}
                      title="Delete course"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setShowAddQuiz(!showAddQuiz)}>
              {showAddQuiz ? <><FiX /> Cancel</> : <><FiPlus /> Add New Quiz</>}
            </button>
          </div>

          {showAddQuiz && (
            <div className="admin-form-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>📝 Create New Quiz</h3>
              <form onSubmit={handleCreateQuiz}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label>Select Course *</label>
                    <select className="form-input" value={newQuiz.course}
                      onChange={e => handleQuizFieldChange('course', e.target.value)} required>
                      <option value="">-- Select a course --</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input className="form-input" placeholder="e.g. React Hooks Quiz" value={newQuiz.title}
                      onChange={e => handleQuizFieldChange('title', e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Topic Index</label>
                    <input className="form-input" type="number" min="0" value={newQuiz.topicIndex}
                      onChange={e => handleQuizFieldChange('topicIndex', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label>Subtopic Index</label>
                    <input className="form-input" type="number" min="0" value={newQuiz.subtopicIndex}
                      onChange={e => handleQuizFieldChange('subtopicIndex', parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ❓ Questions
                  <button type="button" className="btn btn-sm btn-outline" onClick={addQuestion}><FiPlusCircle /> Add Question</button>
                </h4>

                {newQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="admin-topic-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--secondary-dark)' }}>Question {qIdx + 1}</span>
                      {newQuiz.questions.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removeQuestion(qIdx)}><FiTrash2 /></button>
                      )}
                    </div>
                    <textarea className="form-input" rows="2" placeholder="Enter question" value={q.question}
                      onChange={e => handleQuestionChange(qIdx, 'question', e.target.value)}
                      style={{ marginBottom: '0.75rem', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer === oIdx}
                            onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                            title="Mark as correct answer" />
                          <input className="form-input" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt} onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                            style={{ flex: 1 }} />
                        </div>
                      ))}
                    </div>
                    <input className="form-input" placeholder="Explanation (shown after quiz)" value={q.explanation}
                      onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)} />
                  </div>
                ))}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                    {saving ? 'Creating...' : '✨ Create Quiz'}
                  </button>
                  <button type="button" className="btn btn-outline btn-lg" onClick={() => setShowAddQuiz(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3><FiFileText /> All Quizzes ({quizzes.length})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Attempts</th>
                <th>Avg Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.course?.title || 'N/A'}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>{quiz.attempts}</td>
                  <td>
                    <span className={`recent-item-score ${quiz.avgScore >= 70 ? 'score-high' : quiz.avgScore >= 40 ? 'score-medium' : 'score-low'}`}>
                      {quiz.avgScore}%
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                      title="Delete quiz"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3><FiAward /> Recent Results ({results.length})</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Quiz</th>
                <th>Course</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                        {result.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{result.user?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{result.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{result.quiz?.title || 'Deleted Quiz'}</td>
                  <td>{result.course?.title || 'N/A'}</td>
                  <td>{result.score}/{result.totalQuestions}</td>
                  <td>
                    <span className={`recent-item-score ${result.percentage >= 70 ? 'score-high' : result.percentage >= 40 ? 'score-medium' : 'score-low'}`}>
                      {result.percentage}%
                    </span>
                  </td>
                  <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No quiz results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
