import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, TrendingUp, Clock, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, pendingBookings: 0, confirmedBookings: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/stats').then(r => setStats(r.data.stats || {})).catch(() => {}),
      api.get('/bookings/owner?limit=5').then(r => setBookings(r.data.bookings || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const labels = {
      pending: t('booking.pending'),
      confirmed: t('booking.confirmed'),
      cancelled: t('booking.cancelled')
    };
    if (s === 'pending') return <span className="badge-pending">{labels[s] || s}</span>;
    if (s === 'confirmed') return <span className="badge-confirmed">{labels[s] || s}</span>;
    return <span className="badge-cancelled">{labels[s] || s}</span>;
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Bonjour, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tableau de bord propriétaire</p>
        </div>
        <Link to="/owner/properties/add" className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap self-start sm:self-auto">
          <Plus className="w-4 h-4" /> {t('nav.addProperty')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('nav.properties'), value: stats.properties ?? 0, icon: Home, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-600/20' },
          { label: t('booking.pending'), value: stats.pendingBookings ?? 0, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-600/20' },
          { label: t('booking.confirmed'), value: stats.confirmedBookings ?? 0, icon: Calendar, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-600/20' },
          { label: t('nav.revenue'), value: formatPrice(stats.revenue ?? stats.totalRevenue ?? 0), icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-600/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
            <div className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Actions rapides</h2>
          <div className="space-y-3">
            {[
              { to: '/owner/properties/add', icon: Plus, label: t('nav.addProperty') },
              { to: '/owner/properties', icon: Home, label: t('nav.myProperties') },
              { to: '/owner/bookings', icon: Calendar, label: 'Gérer les réservations' },
              { to: '/owner/revenue', icon: TrendingUp, label: t('nav.revenue') },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-gray-50 dark:hover:bg-white/5"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <Icon className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Réservations récentes</h2>
            <Link to="/owner/bookings" className="text-primary-500 hover:text-primary-600 text-sm font-semibold">Voir tout</Link>
          </div>
          {bookings.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>{t('common.noData')}</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b._id} className="flex items-center justify-between p-3 rounded-xl border"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{b.property?.title || 'Logement'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{b.client?.name} · {formatDate(b.checkIn)}</p>
                  </div>
                  {statusBadge(b.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
