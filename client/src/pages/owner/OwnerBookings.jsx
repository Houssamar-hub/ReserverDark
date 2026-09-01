import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Check, X, Clock, User, Phone, Mail,
  Search, MapPin, CheckCircle2, AlertCircle
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';

export default function OwnerBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/owner');
      setBookings(res.data.bookings || []);
    } catch {
      toast.error('Erreur lors du chargement des réservations');
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
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' ? true : b.status === filter;
    const matchesSearch =
      (b.property?.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.client?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.property?.city || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.bookings')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gérez et suivez les demandes de réservation de vos logements.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Toutes les réservations', count: counts.all, icon: Calendar, color: 'var(--accent)' },
          { label: 'En attente de confirmation', count: counts.pending, icon: Clock, color: '#eab308' },
          { label: 'Réservations confirmées', count: counts.confirmed, icon: CheckCircle2, color: '#22c55e' },
          { label: 'Annulées / Rejetées', count: counts.cancelled, icon: AlertCircle, color: '#ef4444' },
        ].map(({ label, count, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{count}</div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'Toutes', count: counts.all },
            { key: 'pending', label: 'En attente', count: counts.pending },
            { key: 'confirmed', label: 'Confirmées', count: counts.confirmed },
            { key: 'cancelled', label: 'Annulées', count: counts.cancelled },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5"
              style={
                filter === key
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
              }
            >
              {label}
              <span
                className="px-1.5 py-0.2 text-[10px] rounded-full"
                style={{
                  backgroundColor: filter === key ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                  color: filter === key ? '#fff' : 'var(--text-primary)'
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher voyageur, logement..."
            className="input pl-10 py-2 text-xs"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucune réservation trouvée
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {filter === 'all'
              ? 'Vous n’avez reçu aucune réservation pour le moment.'
              : `Aucune réservation avec le statut "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => (
            <div
              key={b._id}
              className="card p-5 md:p-6 transition-all hover:shadow-md"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: Property & Client info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
                    <img
                      src={formatImageUrl(b.property?.images?.[0])}
                      onError={handleImageError}
                      alt={b.property?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                        {b.property?.title || 'Logement'}
                      </span>
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

                    {/* Client info */}
                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1 font-semibold" style={{ color: 'var(--text-primary)' }}>
                        <User className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        {b.client?.name || 'Voyageur'}
                      </span>
                      {b.client?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {b.client.email}
                        </span>
                      )}
                      {b.client?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {b.client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle: Dates & Price */}
                <div className="flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="text-left lg:text-right">
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Séjour ({b.nights || 1} nuit{b.nights > 1 ? 's' : ''})
                    </div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {b.guests} voyageur{b.guests > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Total à recevoir
                    </div>
                    <div className="text-xl font-extrabold" style={{ color: 'var(--accent)' }}>
                      {formatPrice(b.totalPrice)}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                {b.status === 'pending' && (
                  <div className="flex lg:flex-col gap-2 pt-4 lg:pt-0 border-t lg:border-t-0" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => handleStatusChange(b._id, 'confirmed')}
                      disabled={actionLoading === b._id}
                      className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Confirmer
                    </button>
                    <button
                      onClick={() => handleStatusChange(b._id, 'rejected')}
                      disabled={actionLoading === b._id}
                      className="flex-1 lg:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
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
  );
}
