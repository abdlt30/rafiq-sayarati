import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 pb-24 max-w-md mx-auto w-full">
        {children || <Outlet />}
      </main>

      <BottomNav />
    </div>
  );
}
