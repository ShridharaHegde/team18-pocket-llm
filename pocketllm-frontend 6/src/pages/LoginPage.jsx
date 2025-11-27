import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/app/chat');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="grid-lines"></div>
      </div>
      
      <div className="login-container">
        <div className="login-header">
          <div className="logo-large">
            <span className="logo-bracket">{'<'}</span>
            <span className="logo-text">PocketLLM</span>
            <span className="logo-bracket">{'/>'}</span>
          </div>
          <p className="login-tagline">Local LLM Inference Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              User not found
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="form-links">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="link-button"
            >
              ← Back to Home
            </button>
            <span className="separator">•</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="link-button"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p className="demo-hint">
            <strong>Demo Credentials:</strong><br/>
            <code>admin</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
