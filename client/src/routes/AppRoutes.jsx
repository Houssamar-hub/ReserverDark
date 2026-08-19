import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import ClientLayout from '../layouts/ClientLayout';
import OwnerLayout from '../layouts/OwnerLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import Properties from '../pages/public/Properties';
import PropertyDetails from '../pages/public/PropertyDetails';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Client Pages
import ClientDashboard from '../pages/client/ClientDashboard';
import MyBookings from '../pages/client/MyBookings';
import Favorites from '../pages/client/Favorites';
import Messages from '../pages/client/Messages';
import Notifications from '../pages/client/Notifications';
import Profile from '../pages/client/Profile';

// Owner Pages
import OwnerDashboard from '../pages/owner/OwnerDashboard';
import MyProperties from '../pages/owner/MyProperties';
import AddProperty from '../pages/owner/AddProperty';
import EditProperty from '../pages/owner/EditProperty';
import OwnerBookings from '../pages/owner/OwnerBookings';
import Calendar from '../pages/owner/Calendar';
import Revenue from '../pages/owner/Revenue';
import OwnerProfile from '../pages/owner/OwnerProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Owners from '../pages/admin/Owners';
import AdminProperties from '../pages/admin/Properties';
import AdminBookings from '../pages/admin/Bookings';
import AdminReviews from '../pages/admin/Reviews';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

// Protected Route Components
import ProtectedRoute from './ProtectedRoute';
import OwnerRoute from './OwnerRoute';
import AdminRoute from './AdminRoute';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/" /> : <Register />
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Client Routes */}
      <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/bookings" element={<MyBookings />} />
          <Route path="/client/favorites" element={<Favorites />} />
          <Route path="/client/messages" element={<Messages />} />
          <Route path="/client/notifications" element={<Notifications />} />
          <Route path="/client/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Owner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
        <Route element={<OwnerLayout />}>
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/properties" element={<MyProperties />} />
          <Route path="/owner/properties/add" element={<AddProperty />} />
          <Route path="/owner/properties/:id/edit" element={<EditProperty />} />
          <Route path="/owner/bookings" element={<OwnerBookings />} />
          <Route path="/owner/calendar" element={<Calendar />} />
          <Route path="/owner/revenue" element={<Revenue />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/owners" element={<Owners />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;