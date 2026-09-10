import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Calendar, TrendingUp, Clock, Plus,
  User, Phone, Mail, MapPin, Check, X,
  Search, CheckCircle2, AlertCircle, BarChart3,
  DollarSign, ArrowUpRight, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';
import { generateReportPdf } from '../../utils/generateReportPdf';
import toast from 'react-hot-toast';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function OwnerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ properties: 0, pendingBookings: 0, confirmedBookings: 0, revenue: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [chartMode, setChartMode] = useState('count'); // 'count' | 'revenue'
  const [bookingFilter, setBookingFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/bookings/stats').catch(() => ({ data: {} })),
        api.get('/bookings/owner').catch(() => ({ data: {} })),
      ]);
      setStats(statsRes.data?.stats || {});
      setBookings(bookingsRes.data?.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(prev =>
        prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      toast.success(
        newStatus === 'confirmed'
          ? 'Réservation confirmée avec succès !'
          : newStatus === 'rejected'
          ? 'Réservation rejetée'
          : 'Statut mis à jour'
      );
      // Refresh stats
      api.get('/bookings/stats').then(r => setStats(r.data.stats || {})).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const exportFinancialReport = () => {
    try {
      generateReportPdf({ user, stats, bookings });
      toast.success('Rapport PDF généré avec succès !');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la génération du rapport PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  // Monthly stats calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');

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
      pendingCount: monthBookings.filter(b => b.status === 'pending').length,
      revenue,
    };
  });

  const maxCount = Math.max(...monthlyStats.map(m => m.totalCount), 5);
  const maxRevenue = Math.max(...monthlyStats.map(m => m.revenue), 2000);

  const thisMonthData = monthlyStats[currentMonthIndex];

  // Filtering bookings for the detailed list
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingFilter === 'all' ? true : b.status === bookingFilter;
    const matchesSearch =
      (b.property?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.property?.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.email || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: bookings.length,
    pending: pendingBookings.length,
    confirmed: confirmedBookings.length,
    cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Bonjour, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Voici les statistiques de vos réservations et l'activité de vos logements pour {currentYear}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportFinancialReport}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold self-start sm:self-auto hover:border-blue-500 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Exporter le rapport
          </button>
          <Link
            to="/owner/properties/add"
            className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('nav.addProperty')}
          </Link>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Réservations</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {counts.all}
          </div>
          <div className="text-[11px] mt-1 text-yellow-600 dark:text-yellow-400 font-medium">
            {counts.pending} en attente de réponse
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Réservations Validées</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-600/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">
            {counts.confirmed}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Séjours confirmés ou complétés
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Revenu ce mois ({MONTH_NAMES[currentMonthIndex]})</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-600/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--accent)' }}>
            {formatPrice(thisMonthData.revenue)}
          </div>
          <div className="text-[11px] mt-1 text-green-600 dark:text-green-400 font-medium">
            {thisMonthData.confirmedCount} réservation(s) confirmée(s)
          </div>
        </div>

        <div className="card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Revenu Total Cumulé</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(stats.revenue ?? stats.totalRevenue ?? 0)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
            Gains globaux enregistrés
          </div>
        </div>
      </div>

      {/* MONTHLY STATISTICS CHART (Statistiques par Mois) */}
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Statistiques mensuelles des réservations ({currentYear})
              </h2>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Visualisez le nombre de réservations et les revenus générés mois par mois.
            </p>
          </div>

          {/* Mode toggle: Réservations vs Revenus */}
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
              Revenus (MAD) / mois
            </button>
          </div>
        </div>

        {/* Interactive Bar Chart for 12 months */}
        <div className="h-64 sm:h-72 flex items-end gap-2 sm:gap-4 pt-10 pb-4 px-2">
          {monthlyStats.map((item) => {
            const isCurrentMonth = item.monthIndex === currentMonthIndex;
            const value = chartMode === 'count' ? item.totalCount : item.revenue;
            const maxVal = chartMode === 'count' ? maxCount : maxRevenue;
            const heightPercent = maxVal > 0 ? (value / maxVal) * 100 : 0;

            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 z-20 text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-900 text-white whitespace-nowrap shadow-md pointer-events-none">
                  {chartMode === 'count' ? `${item.totalCount} réservations` : formatPrice(item.revenue)}
                </div>

                {/* Bar */}
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

                {/* Month Label */}
                <span
                  className="text-[11px] font-bold transition-colors"
                  style={{ color: isCurrentMonth ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {item.month}
                </span>

                {/* Sub value */}
                <span className="text-[9px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                  {chartMode === 'count' ? item.totalCount : `${Math.round(item.revenue / 1000)}k`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED BOOKINGS SECTION: "Qui a réservé quel logement ?" */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Détails des réservations
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Informations complètes sur les voyageurs, les logements réservés, les dates et montants.
            </p>
          </div>

          <Link
            to="/owner/calendar"
            className="btn-secondary text-xs font-bold px-4 py-2.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" /> Voir le calendrier
          </Link>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'Toutes', count: counts.all },
              { key: 'pending', label: 'En attente', count: counts.pending },
              { key: 'confirmed', label: 'Confirmées', count: counts.confirmed },
              { key: 'cancelled', label: 'Annulées', count: counts.cancelled },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setBookingFilter(key)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5"
                style={
                  bookingFilter === key
                    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                    : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
                }
              >
                {label}
                <span
                  className="px-1.5 py-0.2 text-[10px] rounded-full"
                  style={{
                    backgroundColor: bookingFilter === key ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                    color: bookingFilter === key ? '#fff' : 'var(--text-primary)'
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher voyageur, logement, ville..."
              className="input pl-10 py-2 text-xs"
            />
          </div>
        </div>

        {/* Bookings Detailed Cards List */}
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-20 p-6">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Aucune réservation trouvée
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {bookingFilter === 'all'
                ? 'Aucune réservation enregistrée pour vos logements.'
                : `Aucune réservation avec le statut "${bookingFilter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="card p-5 md:p-6 transition-all hover:shadow-lg border"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Section: Property thumbnail & Title & Voyageur details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 border shadow-xs" style={{ borderColor: 'var(--border)' }}>
                      <img
                        src={formatImageUrl(b.property?.images?.[0])}
                        onError={handleImageError}
                        alt={b.property?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/properties/${b.property?._id || b.property}`}
                          target="_blank"
                          className="font-bold text-base truncate hover:underline flex items-center gap-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {b.property?.title || 'Logement'}
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                        </Link>
                        <span className={
                          b.status === 'confirmed'
                            ? 'badge-confirmed text-[11px]'
                            : b.status === 'pending'
                            ? 'badge-pending text-[11px]'
                            : 'badge-cancelled text-[11px]'
                        }>
                          {b.status === 'confirmed' ? 'Confirmée' : b.status === 'pending' ? 'En attente' : b.status === 'rejected' ? 'Rejetée' : 'Annulée'}
                        </span>
                      </div>

                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        {b.property?.city || 'Maroc'}
                      </p>

                      {/* Voyageur (Client Details) */}
                      <div className="p-3 rounded-xl border flex flex-wrap items-center gap-4 text-xs"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                            style={{ backgroundColor: 'var(--accent)' }}>
                            {b.client?.avatar ? (
                              <img src={formatImageUrl(b.client.avatar)} onError={handleImageError} alt="Client" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              (b.client?.name || 'V')[0]?.toUpperCase()
                            )}
                          </div>
                          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                            {b.client?.name || 'Voyageur'}
                          </span>
                        </div>

                        {b.client?.email && (
                          <a href={`mailto:${b.client.email}`} className="flex items-center gap-1 hover:underline" style={{ color: 'var(--text-muted)' }}>
                            <Mail className="w-3.5 h-3.5" />
                            {b.client.email}
                          </a>
                        )}

                        {b.client?.phone && (
                          <a href={`tel:${b.client.phone}`} className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold hover:underline">
                            <Phone className="w-3.5 h-3.5" />
                            {b.client.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Dates du séjour & Total Price */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0"
                    style={{ borderColor: 'var(--border)' }}>
                    <div className="text-left lg:text-right space-y-0.5">
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Dates du séjour
                      </div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {b.nights || 1} nuit{b.nights > 1 ? 's' : ''} · {b.guests} voyageur{b.guests > 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        Montant Total
                      </div>
                      <div className="text-xl sm:text-2xl font-black" style={{ color: 'var(--accent)' }}>
                        {formatPrice(b.totalPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Actions Buttons */}
                  {b.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => handleStatusChange(b._id, 'confirmed')}
                        disabled={actionLoading === b._id}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm"
                      >
                        <Check className="w-4 h-4" /> Confirmer
                      </button>
                      <button
                        onClick={() => handleStatusChange(b._id, 'rejected')}
                        disabled={actionLoading === b._id}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                      >
                        <X className="w-4 h-4" /> Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

