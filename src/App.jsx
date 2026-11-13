import AppProviders from './app/providers/AppProviders';
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ui/ErrorBoundary'; // ✅ استيراد الدرع

export default function App() {
  return (
    <ErrorBoundary> {/* ✅ تغليف التطبيق بالدرع */}
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}
