import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          padding: '2rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-danger)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            maxWidth: '600px'
          }}>
            <h2 style={{
              color: 'var(--accent-danger)',
              marginBottom: '1rem',
              fontSize: '18px',
              fontWeight: 600
            }}>
              ⚠️ Application Error
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '1rem',
              fontSize: '14px'
            }}>
              Something went wrong. Please refresh the page or contact support.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Error Details
                </summary>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'var(--accent-primary)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
