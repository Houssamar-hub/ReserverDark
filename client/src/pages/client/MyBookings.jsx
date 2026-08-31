import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';

export default function MyBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try {
      await api.delete(`/bookings/${id}/cancel`);
      toast.success(t('common.success'));
      fetchBookings();
    } catch {
      toast.error(t('common.error'));
    }
  };

  const statusInfo = {
    pending: { label: t('booking.pending'), color: 'badge-pending', icon: Clock },
    confirmed: { label: t('booking.confirmed'), color: 'badge-confirmed', icon: CheckCircle },
    cancelled: { label: t('booking.cancelled'), color: 'badge-cancelled', icon: XCircle },
    completed: { label: t('booking.completed'), color: 'badge-completed', icon: CheckCircle },
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {t('nav.bookings')}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        {bookings.length} {t('common.noData') === 'Aucune donnée' ? 'réservation(s) au total' : 'total booking(s)'}
      </p>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === s
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}>
            {s === 'all' ? t('common.all') : statusInfo[s]?.label || s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('common.noData')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('common.noData') === 'Aucune donnée' ? "Vous n'avez pas encore de réservations." : 'No bookings in this category.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => {
            const si = statusInfo[b.status] || statusInfo.pending;
            const StatusIcon = si.icon;
            return (
              <div key={b._id} className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <img src={b.property?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300'} alt=""
                    className="w-full sm:w-44 h-44 object-cover flex-shrink-0" />
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{b.property?.title || 'Logement'}</h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{b.property?.city}, Maroc</p>
                      </div>
                      <span className={`flex items-center gap-1 ${si.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {si.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {b.guests} {t('property.guests')}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-primary-600 dark:text-primary-400 font-extrabold">{formatPrice(b.totalPrice || b.property?.pricePerNight)}</span>
                      {b.status === 'pending' && (
                        <button onClick={() => cancelBooking(b._id)}
                          className="btn-danger flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-semibold">
                          <Trash2 className="w-3.5 h-3.5" /> {t('booking.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
