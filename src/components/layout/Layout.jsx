import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* الشريط الجانبي (للكمبيوتر فقط) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)] h-full">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* تم إزالة <Header /> من هنا لأن كل صفحة لها شريطها الخاص */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-8 w-full max-w-4xl mx-auto">
          {children || <Outlet />}
        </main>
      </div>

      {/* الشريط السفلي */}
      <div className="md:hidden fixed bottom-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
