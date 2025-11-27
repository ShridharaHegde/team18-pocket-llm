import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page" data-theme="dark">
      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-bracket">&lt;</span>
          <span className="logo-text">PocketLLM</span>
          <span className="logo-bracket">/&gt;</span>
        </div>
        <nav className="landing-nav">
          <button onClick={() => navigate('/login')} className="nav-link">
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="nav-button">
            Sign Up
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Powered by Ollama
          </div>
          
          <h1 className="hero-title">
            Your Personal
            <span className="gradient-text"> AI Assistant</span>
            <br />
            Running Locally
          </h1>
          
          <p className="hero-description">
            Experience the power of large language models right on your machine. 
            Private, secure, and lightning-fast conversations with state-of-the-art AI.
          </p>

          <div className="hero-cta">
            <button onClick={() => navigate('/register')} className="cta-primary">
              <span>Get Started</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button onClick={() => navigate('/login')} className="cta-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In</span>
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Private</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">Offline</div>
              <div className="stat-label">Capable</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">Open</div>
              <div className="stat-label">Source</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-controls">
                <span className="control-dot red"></span>
                <span className="control-dot yellow"></span>
                <span className="control-dot green"></span>
              </div>
              <div className="terminal-title">chat.session</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-line">
                <span className="prompt">user@pocketllm:~$</span>
                <span className="command">What can you help me with?</span>
              </div>
              <div className="terminal-line response">
                <span className="prompt">assistant:</span>
                <span className="typing-text">I can help you with coding, writing, analysis, and more...</span>
              </div>
              <div className="terminal-line">
                <span className="prompt">user@pocketllm:~$</span>
                <span className="cursor">_</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Why PocketLLM?</h2>
          <p className="section-subtitle">Everything you need for private AI conversations</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="feature-title">Private & Secure</h3>
            <p className="feature-description">
              Your conversations never leave your machine. Complete privacy and data sovereignty.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Optimized local inference with hardware acceleration for instant responses.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <h3 className="feature-title">Multiple Models</h3>
            <p className="feature-description">
              Choose from various models including Llama, Gemma, and Mistral for different tasks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <h3 className="feature-title">No Internet Required</h3>
            <p className="feature-description">
              Work completely offline. Perfect for sensitive projects or low connectivity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="feature-title">Chat History</h3>
            <p className="feature-description">
              Access all your conversations anytime. Search, filter, and continue past discussions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3 className="feature-title">Customizable</h3>
            <p className="feature-description">
              Adjust temperature, max tokens, and other parameters to fine-tune responses.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to get started?</h2>
          <p className="cta-description">
            Join developers and teams using PocketLLM for private, powerful AI assistance.
          </p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/register')} className="cta-primary large">
              Create Free Account
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <p className="cta-note">No credit card required • 100% free • Open source</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-bracket">&lt;</span>
            <span className="logo-text">PocketLLM</span>
            <span className="logo-bracket">/&gt;</span>
          </div>
          <p className="footer-text">
            Private, local, and powerful AI conversations.
          </p>
          <p className="footer-copyright">
            © 2024 PocketLLM. Built for CSCI 578.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
