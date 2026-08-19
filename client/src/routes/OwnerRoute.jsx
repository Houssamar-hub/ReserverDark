import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OwnerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default OwnerRoute;