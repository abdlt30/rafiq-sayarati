import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-[#070b14] text-white overflow-hidden font-sans">
      {/* الشريط الجانبي (يظهر فقط في الشاشات الكبيرة) */}
      <div className="hidden md:block w-64 flex-shrink-0 border-l border-[#1e2a44] bg-[#0e1526]">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          {children || <Outlet />}
        </main>
      </div>

      {/* الشريط السفلي (يظهر فقط في الهواتف) */}
      <div className="md:hidden fixed bottom-0 w-full z-50">
        <BottomNav />
      </div>
    </div>
  );
}
