import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="admin" />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;