import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import ContentViewer from './components/courses/ContentViewer';
import QuizPage from './components/quiz/QuizPage';
import QuizResult from './components/quiz/QuizResult';
import Dashboard from './components/dashboard/Dashboard';
import EnrolledCourses from './components/courses/EnrolledCourses';
import AdminPanel from './components/admin/AdminPanel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/courses" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/courses/:courseId/learn/:topicIndex/:subtopicIndex" element={<ProtectedRoute><ContentViewer /></ProtectedRoute>} />
        <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/results/:resultId" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
        <Route path="/enrolled" element={<ProtectedRoute><EnrolledCourses /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/courses" />} />
        <Route path="*" element={<Navigate to="/courses" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
