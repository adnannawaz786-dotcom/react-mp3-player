import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/AudioPlayer.css';
import App from './App';

// Error boundary component to catch and handle React errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#dc3545', marginBottom: '16px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            The MP3 player encountered an unexpected error. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
                Error Details (Development Mode)
              </summary>
              <pre style={{ 
                backgroundColor: '#f1f3f4', 
                padding: '10px', 
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxWidth: '80vw'
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Check for browser compatibility
const checkBrowserSupport = () => {
  const isSupported = {
    audio: !!window.Audio,
    fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),
    localStorage: !!window.localStorage
  };

  const unsupportedFeatures = Object.keys(isSupported).filter(key => !isSupported[key]);
  
  if (unsupportedFeatures.length > 0) {
    console.warn('Some features may not work properly. Unsupported:', unsupportedFeatures);
  }

  return unsupportedFeatures.length === 0;
};

// Initialize the React application
const initializeApp = () => {
  // Check browser support
  const isFullySupported = checkBrowserSupport();
  
  if (!isFullySupported) {
    console.warn('Browser may not fully support all MP3 player features');
  }

  // Get the root element
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found. Make sure your HTML has a div with id="root"');
    return;
  }

  // Create React root and render the application
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Handle any uncaught errors globally
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Hot module replacement for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    initializeApp();
  });
}