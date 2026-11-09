import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    // ✅ إصلاح 1: استخدام h-[100dvh] بدلاً من h-screen لمنع مشاكل المتصفح في الهواتف
    <div className="flex h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      
      {/* الشريط الجانبي (للكمبيوتر) */}
      {/* ✅ إصلاح 3: استخدام border-e بدلاً من border-l لدعم اللغتين العربية والإنجليزية */}
      <div className="hidden md:block w-64 flex-shrink-0 border-e border-[var(--border)] bg-[var(--surface)] h-full">
        <Sidebar />
      </div>

      {/* حاوية المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 
            ملاحظة: max-w-4xl mx-auto يضمن أن المحتوى لا يتمدد بشكل مزعج على الشاشات الكبيرة.
            pb-24 يترك مساحة للشريط السفلي في الهواتف.
        */}
        <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 pb-24 md:pb-8 scroll-smooth">
          {/* هنا سيتم عرض الصفحة المطلوبة */}
          <Outlet /> 
        </main>
      </div>

      {/* الشريط السفلي (للهواتف) */}
      {/* ✅ إصلاح 2: إضافة pb-[env(safe-area-inset-bottom)] لدعم شاشات iPhone */}
      <div className="md:hidden fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom)] bg-[var(--surface)]">
        <BottomNav />
      </div>
    </div>
  );
}
