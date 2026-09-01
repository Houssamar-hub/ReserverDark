import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Home, Calendar, MessageSquare, Heart,
  Users, Building2, CreditCard, Settings, Bell, Star,
  FileText, LogOut, PlusSquare, User
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const clientLinks = [
    { to: '/client',               icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/client/bookings',      icon: Calendar,        label: t('nav.bookings') },
    { to: '/client/favorites',     icon: Heart,           label: t('nav.favorites') },
    { to: '/client/messages',      icon: MessageSquare,   label: t('nav.messages') },
    { to: '/client/notifications', icon: Bell,            label: t('nav.notifications') },
    { to: '/client/profile',       icon: User,            label: t('nav.profile') },
  ];

  const ownerLinks = [
    { to: '/owner',                   icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/owner/properties',        icon: Home,            label: t('nav.myProperties') },
    { to: '/owner/properties/add',    icon: PlusSquare,      label: t('nav.addProperty') },
    { to: '/owner/bookings',          icon: Calendar,        label: t('nav.bookings') },
    { to: '/owner/messages',          icon: MessageSquare,   label: t('nav.messages') },
    { to: '/owner/calendar',          icon: Calendar,        label: t('nav.calendar') },
    { to: '/owner/revenue',           icon: CreditCard,      label: t('nav.revenue') },
    { to: '/owner/profile',           icon: User,            label: t('nav.profile') },
  ];

  const adminLinks = [
    { to: '/admin',            icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/admin/users',      icon: Users,           label: t('nav.users') },
    { to: '/admin/owners',     icon: Building2,       label: t('nav.owners') },
    { to: '/admin/properties', icon: Home,            label: t('nav.properties') },
    { to: '/admin/bookings',   icon: Calendar,        label: t('nav.bookings') },
    { to: '/admin/reviews',    icon: Star,            label: t('nav.reviews') },
    { to: '/admin/reports',    icon: FileText,        label: t('nav.reports') },
    { to: '/admin/settings',   icon: Settings,        label: t('nav.settings') },
  ];

  const links = role === 'admin' ? adminLinks : role === 'owner' ? ownerLinks : clientLinks;

  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 overflow-y-auto flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 space-y-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-white/10'
              }`
            }
            style={({ isActive }) => (isActive ? {} : { color: 'var(--text-muted)' })}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
          <LogOut className="w-4 h-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;