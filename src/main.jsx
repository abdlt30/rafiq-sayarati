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

  componentDidCatch(error, errorInfo) {
    // هذا السطر سيطبع الخطأ الحقيقي في كونسول المتصفح لسهولة اكتشافه
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">عذراً، حدث خطأ!</h1>
          <div className="bg-black/30 p-4 rounded-xl w-full max-w-lg overflow-auto text-sm font-mono mb-6" dir="ltr">
            {this.state.error.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-white text-red-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
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
