import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building2, Calendar, DollarSign,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  BarChart3, User, Mail, MapPin, Eye, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState('count'); // 'count' | 'revenue'

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: {} })),
        api.get('/admin/bookings?limit=10').catch(() => ({ data: {} })),
      ]);
      setStats(statsRes.data?.stats || {});
      setBookings(bookingsRes.data?.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  // Monthly stats calculations from bookings
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const monthBookings = bookings.filter(b => {
      const d = new Date(b.createdAt || b.checkIn);
      return d.getMonth() === i && d.getFullYear() === currentYear;
    });

    const confirmedInMonth = monthBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const revenue = confirmedInMonth.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    return {
      month: MONTH_NAMES[i],
      monthIndex: i,
      totalCount: monthBookings.length,
      confirmedCount: confirmedInMonth.length,
      revenue,
    };
  });

  const maxCount = Math.max(...monthlyStats.map(m => m.totalCount), 5);
  const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue), 5000);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Tableau de bord Administrateur
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Vue d'ensemble de la plateforme ReserverDark : utilisateurs, annonces et réservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/properties" className="btn-secondary text-xs font-bold px-4 py-2.5 rounded-xl">
            Modérer les annonces
          </Link>
          <Link to="/admin/users" className="btn-primary text-xs font-bold px-4 py-2.5 rounded-xl">
            Gérer les utilisateurs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Utilisateurs</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {(stats?.totalUsers || 0) + (stats?.totalOwners || 0)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {stats?.totalClients || stats?.totalUsers || 0} clients · {stats?.totalOwners || 0} hôtes
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Logements Publiés</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-600/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {stats?.totalProperties || 0}
          </div>
          <div className="text-[11px] mt-1 text-yellow-600 dark:text-yellow-400 font-semibold">
            {stats?.pendingProperties || 0} en attente de validation
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Réservations</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--accent)' }}>
            {stats?.totalBookings || bookings.length}
          </div>
          <div className="text-[11px] mt-1 text-green-600 dark:text-green-400 font-semibold">
            {stats?.confirmedBookings || 0} confirmées
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Volume Financier</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-600/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(stats?.totalRevenue || 0)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Sur toutes les transactions
          </div>
        </div>
      </div>

      {/* Monthly Statistics Chart */}
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Activité globale de la plateforme ({currentYear})
              </h2>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Évolution du volume de réservations par mois sur ReserverDark.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setChartMode('count')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={chartMode === 'count'
                ? { backgroundColor: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-muted)' }}
            >
              Réservations / mois
            </button>
            <button
              onClick={() => setChartMode('revenue')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={chartMode === 'revenue'
                ? { backgroundColor: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-muted)' }}
            >
              Volume MAD / mois
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 flex items-end gap-2 sm:gap-4 pt-10 pb-4 px-2">
          {monthlyStats.map((item) => {
            const isCurrentMonth = item.monthIndex === currentMonthIndex;
            const value = chartMode === 'count' ? item.totalCount : item.revenue;
            const maxVal = chartMode === 'count' ? maxCount : maxRevenue;
            const heightPercent = maxVal > 0 ? (value / maxVal) * 100 : 0;

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900 text-white whitespace-nowrap shadow-md pointer-events-none">
                  {chartMode === 'count' ? `${item.totalCount} réservations` : formatPrice(item.revenue)}
                </div>

                <div
                  className="w-full rounded-t-xl transition-all duration-500 hover:brightness-110"
                  style={{
                    height: `${Math.max(heightPercent, 8)}%`,
                    backgroundColor: isCurrentMonth
                      ? 'var(--accent)'
                      : value > 0
                      ? 'rgba(37,99,235,0.45)'
                      : 'var(--border)',
                    boxShadow: isCurrentMonth ? '0 0 16px rgba(37,99,235,0.35)' : 'none',
                  }}
                />

                <span
                  className="text-[11px] font-bold transition-colors"
                  style={{ color: isCurrentMonth ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reservations Detail Table */}
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Dernières réservations sur la plateforme
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Détails des clients, logements et montants réservés récemment.
            </p>
          </div>
          <Link to="/admin/bookings" className="text-xs font-bold text-blue-600 hover:underline">
            Voir tout →
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="text-center py-12 text-xs" style={{ color: 'var(--text-muted)' }}>
            Aucune réservation récente à afficher.
          </p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b._id} className="p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                {/* Client & Property */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                    <img
                      src={formatImageUrl(b.property?.images?.[0])}
                      onError={handleImageError}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {b.property?.title || 'Logement'}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span>👤 {b.client?.name || 'Client'} ({b.client?.email || ''})</span>
                    </p>
                  </div>
                </div>

                {/* Dates & Price */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto text-xs">
                  <div>
                    <span className="block font-semibold" style={{ color: 'var(--text-muted)' }}>Séjour</span>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold" style={{ color: 'var(--text-muted)' }}>Montant</span>
                    <span className="font-extrabold text-sm" style={{ color: 'var(--accent)' }}>
                      {formatPrice(b.totalPrice)}
                    </span>
                  </div>
                  <span className={
                    b.status === 'confirmed'
                      ? 'badge-confirmed text-[10px]'
                      : b.status === 'pending'
                      ? 'badge-pending text-[10px]'
                      : 'badge-cancelled text-[10px]'
                  }>
                    {b.status === 'confirmed' ? 'Confirmée' : b.status === 'pending' ? 'En attente' : 'Annulée'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

