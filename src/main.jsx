import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// حاجز الأخطاء (Error Boundary)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#7f1d1d', color: 'white', minHeight: '100vh', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>عذراً، حدث خطأ!</h1>
          <p style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '10px', fontSize: '14px', direction: 'ltr' }}>
            {this.state.error.toString()}
          </p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'white', color: '#7f1d1d', fontWeight: 'bold', borderRadius: '10px', border: 'none' }}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
