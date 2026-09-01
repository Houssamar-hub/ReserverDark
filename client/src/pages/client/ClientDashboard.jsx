import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, MessageSquare, Bell, Home, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { formatDate } from '../../utils/formatDate';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my?limit=5')
      .then(res => {
        const b = res.data.bookings || [];
        setBookings(b);
        setStats({
          total: b.length,
          pending: b.filter(x => x.status === 'pending').length,
          confirmed: b.filter(x => x.status === 'confirmed').length,
          cancelled: b.filter(x => x.status === 'cancelled').length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const labels = {
      pending: t('booking.pending'),
      confirmed: t('booking.confirmed'),
      cancelled: t('booking.cancelled'),
      completed: t('booking.completed')
    };

    if (status === 'pending') return <span className="badge-pending">{labels[status] || status}</span>;
    if (status === 'confirmed') return <span className="badge-confirmed">{labels[status] || status}</span>;
    if (status === 'cancelled') return <span className="badge-cancelled">{labels[status] || status}</span>;
    return <span className="badge-completed">{labels[status] || status}</span>;
  };

  const quickLinks = [
    { to: '/properties', icon: Home, label: t('nav.properties'), desc: 'Trouver un logement' },
    { to: '/client/bookings', icon: Calendar, label: t('nav.bookings'), desc: 'Mes réservations' },
    { to: '/client/favorites', icon: Heart, label: t('nav.favorites'), desc: 'Mes favoris' },
    { to: '/client/messages', icon: MessageSquare, label: t('nav.messages'), desc: 'Mes messages' },
  ];

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          Bonjour, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Bienvenue sur votre tableau de bord</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-600/20' },
          { label: t('booking.pending'), value: stats.pending, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-600/20' },
          { label: t('booking.confirmed'), value: stats.confirmed, icon: CheckCircle, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-600/20' },
          { label: t('booking.cancelled'), value: stats.cancelled, icon: XCircle, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-600/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickLinks.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="card p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
            <Icon className="w-6 h-6 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{label}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Réservations récentes</h2>
          <Link to="/client/bookings" className="text-primary-500 hover:text-primary-600 text-sm font-semibold">Voir tout</Link>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Aucune réservation pour le moment</p>
            <Link to="/properties" className="mt-3 inline-block text-primary-500 hover:text-primary-600 text-sm font-semibold">Explorer les logements</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b._id} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <img src={b.property?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{b.property?.title || 'Logement'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                  </div>
                </div>
                {statusBadge(b.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
