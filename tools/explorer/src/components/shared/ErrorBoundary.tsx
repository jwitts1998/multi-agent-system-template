import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Explorer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}>
          <div style={{
            maxWidth: 480,
            padding: 32,
            background: '#1e293b',
            borderRadius: 12,
            border: '1px solid #334155',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x26A0;</div>
            <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              Something went wrong
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
              The explorer encountered an unexpected error. This may happen with malformed transcript files.
            </p>
            {this.state.error && (
              <pre style={{
                margin: '12px 0',
                padding: '10px 12px',
                background: '#0f172a',
                borderRadius: 6,
                border: '1px solid #334155',
                fontSize: 11,
                color: '#ef4444',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 120,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: 12,
                padding: '8px 24px',
                fontSize: 13,
                fontWeight: 600,
                background: '#3b82f6',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
