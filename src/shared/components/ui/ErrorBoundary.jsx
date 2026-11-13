import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg)] text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">عذراً، حدث خطأ غير متوقع!</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
            واجه التطبيق مشكلة تقنية. بياناتك محفوظة بأمان. يرجى إعادة تحميل الصفحة.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl active:scale-95 transition-transform"
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
