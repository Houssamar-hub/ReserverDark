import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Users,
  Building2,
  CreditCard,
  Settings,
  Bell,
  Star,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();

  const clientLinks = [
    { to: '/client', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/client/bookings', icon: Calendar, label: 'Mes réservations' },
    { to: '/client/favorites', icon: Heart, label: 'Favoris' },
    { to: '/client/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/client/notifications', icon: Bell, label: 'Notifications' },
    { to: '/client/profile', icon: Settings, label: 'Profil' },
  ];

  const ownerLinks = [
    { to: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/owner/properties', icon: Home, label: 'Mes logements' },
    { to: '/owner/properties/add', icon: Building2, label: 'Ajouter un logement' },
    { to: '/owner/bookings', icon: Calendar, label: 'Réservations' },
    { to: '/owner/calendar', icon: Calendar, label: 'Calendrier' },
    { to: '/owner/revenue', icon: CreditCard, label: 'Revenus' },
    { to: '/owner/profile', icon: Settings, label: 'Profil' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { to: '/admin/properties', icon: Home, label: 'Logements' },
    { to: '/admin/bookings', icon: Calendar, label: 'Réservations' },
    { to: '/admin/reviews', icon: Star, label: 'Avis' },
    { to: '/admin/reports', icon: FileText, label: 'Rapports' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'owner' ? ownerLinks : clientLinks;

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-dark-200 border-r border-white/10 overflow-y-auto">
      <div className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;