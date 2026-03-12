import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBookOpen, FiGrid, FiLogOut, FiCheckSquare, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || (path !== '/courses' && location.pathname.startsWith(path));
  const isCoursesActive = location.pathname === '/courses';

  return (
    <nav className="navbar">
      <Link to="/courses" className="navbar-brand">
        <div className="brand-icon">📚</div>
        LearnAI
      </Link>

      <div className="navbar-links">
        <Link to="/courses" className={`nav-link ${isCoursesActive ? 'active' : ''}`}>
          <FiBookOpen /> Courses
        </Link>
        <Link to="/enrolled" className={`nav-link ${isActive('/enrolled') ? 'active' : ''}`}>
          <FiCheckSquare /> Enrolled
        </Link>
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
          <FiGrid /> Dashboard
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
            <FiSettings /> Admin
          </Link>
        )}
      </div>

      <div className="navbar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="user-name">{user?.name}</span>
        <button className="btn-logout" onClick={logout}>
          <FiLogOut style={{ marginRight: 4 }} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
