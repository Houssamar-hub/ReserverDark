import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Navbar
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="flex">
        <Sidebar
          role="admin"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 md:ml-64 mt-16 min-h-[calc(100vh-64px)] w-full overflow-x-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;