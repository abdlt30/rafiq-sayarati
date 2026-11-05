import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Header />
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  );
}
