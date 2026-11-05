import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      {/* الشريط الجانبي */}
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)] h-full">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
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
