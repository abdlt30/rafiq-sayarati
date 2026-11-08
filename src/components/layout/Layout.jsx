import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      
      {/* الشريط الجانبي (للكمبيوتر) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)] h-full">
        <Sidebar />
      </div>

      {/* حاوية المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 pb-24 md:pb-8 scroll-smooth">
          {/* ✅ هنا سيتم عرض الصفحة المطلوبة */}
          <Outlet /> 
        </main>
      </div>

      {/* الشريط السفلي (للهواتف) */}
      <div className="md:hidden fixed bottom-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
