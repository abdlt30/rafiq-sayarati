import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* الشريط الجانبي */}
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)] h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full">
        <Header />
        <main className="flex-1 p-4 pb-24 md:pb-8 w-full max-w-4xl mx-auto overflow-x-hidden">
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
