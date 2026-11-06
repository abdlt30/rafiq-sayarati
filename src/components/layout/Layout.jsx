import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg)] text-[var(--text)] font-sans">
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* إزالة p-4 من هنا لنقلها للصفحات الداخلية، ليعمل الـ Sticky بشكل مثالي */}
        <main className="flex-1 w-full max-w-4xl mx-auto">
          {children || <Outlet />}
        </main>
      </div>

      <div className="md:hidden fixed bottom-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
