import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>⚠</div>
          <h2 style={{ marginBottom: 8 }}>Algo salió mal</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
