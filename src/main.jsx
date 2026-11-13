import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// ✅ ملاحظة: إذا كان App.jsx يحتوي على <AppProviders>، فلا داعي لاستدعاء AppProvider هنا لتجنب التكرار.
import './index.css';
import { AlertTriangle } from 'lucide-react';

// ✅ حاجز الأخطاء (Error Boundary) المحصن
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
          className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-6 text-center font-sans"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} className="text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold mb-2">عذراً، حدث خطأ غير متوقع</h1>
          <p className="text-[var(--text-muted)] mb-6 text-sm max-w-sm">
            واجه التطبيق مشكلة تقنية أثناء العمل. بياناتك محفوظة بأمان. يرجى إعادة المحاولة.
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
            className="px-8 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-colors shadow-lg active:scale-95"
          >
            إعادة تحميل التطبيق
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
      {/* ✅ تم إزالة AppProvider لأن App.jsx يتكفل به */}
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// ✅ تسجيل Service Worker (ميزة PWA للعمل بدون إنترنت)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('SW registered successfully:', registration.scope);
        
        // ✅ ميزة الشركات الكبرى: إشعار المستخدم بوجود تحديث للتطبيق
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) return;
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // يوجد نسخة جديدة، يمكنك هنا إظهار Toast للمستخدم
                console.log('New content is available; please refresh.');
                // يمكنك استخدام CustomEvent هنا لربطها بواجهة المستخدم لاحقاً
                window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
              } else {
                console.log('Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch(registrationError => {
        console.error('SW registration failed:', registrationError);
      });
  });
}
