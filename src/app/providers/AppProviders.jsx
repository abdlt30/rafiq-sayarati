// ✅ إصلاح حرج 1: تصحيح اسم المكون إلى AppProvider (لأن هذا هو الاسم المُصدَّر في AppContext.jsx)
// ✅ إصلاح حرج 2: إضافة الامتداد .jsx لمنع فشل البناء في Vite
import { AppProvider } from '../../context/AppContext.jsx';

export default function AppProviders({ children }) {
  return (
    // ✅ استخدام الاسم الصحيح هنا أيضاً
    <AppProvider>
      {children}
    </AppProvider>
  );
}
