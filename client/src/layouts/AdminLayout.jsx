import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Navbar />
      <div className="flex">
        <Sidebar role="admin" />
        <main className="flex-1 ml-64 mt-16 min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;