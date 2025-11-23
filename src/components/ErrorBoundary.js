import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            color: 'white',
            padding: '20px',
            fontFamily: 'system-ui'
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              background: '#1a1a1a',
              borderRadius: '10px',
              padding: '15px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '32px'
              }}
            >
              We're sorry for the inconvenience. The app encountered an unexpected error.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                  Error Details
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                background: '#3b82f6',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;