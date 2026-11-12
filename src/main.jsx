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
    // في بيئة الإنتاج (Production)، يجب إرسال هذا الخطأ إلى خدمة مثل Sentry
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert"
          className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="text-6xl mb-4" aria-hidden="true">🚧</div>
          <h1 className="text-2xl font-bold mb-2">عذراً، حدث خطأ غير متوقع</h1>
          <p className="text-[var(--text-muted)] mb-6 text-sm">
            واجه التطبيق مشكلة أثناء العمل. يرجى إعادة المحاولة.
          </p>
          
          {/* ✅ الإصلاح الأمني: عرض تفاصيل الخطأ فقط في بيئة التطوير */}
          {import.meta.env.DEV && this.state.error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl w-full max-w-lg overflow-auto text-xs font-mono mb-6 text-left" dir="ltr">
              <p className="font-bold text-red-500 mb-2">Developer Error Details (Hidden in Production):</p>
              {this.state.error.toString()}
            </div>
          )}
          
          <button 
            type="button"
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-colors shadow-lg active:scale-95"
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

// ✅ تسجيل Service Worker (ضروري جداً لـ PWABuilder وللعمل بدون إنترنت)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // ✅ استخدام BASE_URL ليتكيف المسار تلقائياً مع GitHub Pages أو الدومين المخصص
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('SW registered successfully:', registration.scope);
      })
      .catch(registrationError => {
        console.log('SW registration failed:', registrationError);
      });
  });
}
