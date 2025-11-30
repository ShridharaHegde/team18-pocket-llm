import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import './Layout.css';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme } = useTheme();


  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-bracket">{'<'}</span>
            <span className="logo-text">PocketLLM</span>
            <span className="logo-bracket">{'/>'}</span>
          </div>

        </div>

        <div className="nav-links">
          <NavLink to="chat" className="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Chat</span>
          </NavLink>



          <NavLink to="history" className="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>History</span>
          </NavLink>

          {(user?.role === 'developer' || hasRole('DEVELOPER')) && (
            <NavLink to="developer" className="nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4h18M3 10h18M3 16h10" />
              </svg>
              <span>Developer</span>
            </NavLink>
          )}
          {(user?.role === 'admin' || hasRole('ADMIN')) && (
            <NavLink to="admin" className="nav-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
              </svg>
              <span>Admin</span>
            </NavLink>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>

          <button onClick={toggleTheme} className="icon-button" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button onClick={logout} className="icon-button" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
