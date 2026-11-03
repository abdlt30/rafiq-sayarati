import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar'; // سننشئه الآن

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* الشريط الجانبي (يظهر فقط في الشاشات الكبيرة) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col max-w-full md:max-w-4xl mx-auto w-full pb-20 md:pb-0">
        <Header />
        
        <main className="flex-1 p-4 w-full">
          {children || <Outlet />}
        </main>

        {/* الشريط السفلي (يظهر فقط في الهواتف) */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
