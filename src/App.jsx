import { AppProviders } from './contexts/AppProviders'; // ✅ تصحيح المسار وطريقة الاستيراد (Named Export)
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ui/ErrorBoundary'; 

export default function App() {
  return (
    <ErrorBoundary>
      {/* ✅ تغليف التطبيق بالدرع (تم تصحيح تعليق JSX) */}
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}
