import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Building2, Users, X, Phone, Mail
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/formatDate';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function Calendar() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedDayBookings, setSelectedDayBookings] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, propertiesRes] = await Promise.all([
        api.get('/bookings/owner'),
        api.get('/properties/owner/my')
      ]);
      setBookings(bookingsRes.data.bookings || []);
      setProperties(propertiesRes.data.properties || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday, 1 = Monday...)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Filter bookings by property
  const activeBookings = bookings.filter(b => {
    if (selectedProperty === 'all') return true;
    return b.property?._id === selectedProperty || b.property === selectedProperty;
  });

  const getBookingsForDay = (day) => {
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0);

    return activeBookings.filter(b => {
      if (b.status === 'cancelled' || b.status === 'rejected') return false;
      const checkIn = new Date(b.checkIn);
      checkIn.setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOut);
      checkOut.setHours(0, 0, 0, 0);

      return dayDate >= checkIn && dayDate <= checkOut;
    });
  };

  const handleDayClick = (day, dayBookings) => {
    if (dayBookings.length > 0) {
      setSelectedDayBookings(dayBookings);
      setSelectedDateStr(`${day} ${MONTHS[month]} ${year}`);
    } else {
      setSelectedDayBookings(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.calendar')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Consultez les disponibilités et réservations sur votre calendrier.
          </p>
        </div>

        {/* Property Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl card text-xs font-semibold">
            <Building2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <select
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
              style={{ color: 'var(--text-primary)' }}
            >
              <option value="all">Tous mes logements ({properties.length})</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card p-6 md:p-8">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={goToday}
              className="px-3 py-1 text-xs font-bold rounded-lg border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
            >
              Aujourd'hui
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2.5 rounded-xl border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2.5 rounded-xl border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-3 text-center">
          {DAYS.map(d => (
            <div key={d} className="text-xs font-bold uppercase tracking-wider py-2" style={{ color: 'var(--text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous month trailing days */}
          {Array.from({ length: startOffset }).map((_, i) => {
            const dayNum = prevMonthDays - startOffset + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[90px] md:min-h-[110px] p-2 rounded-xl border opacity-30 select-none"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <span className="text-xs font-semibold">{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday = isCurrentMonth && today.getDate() === day;
            const hasBookings = dayBookings.length > 0;

            return (
              <div
                key={`day-${day}`}
                onClick={() => handleDayClick(day, dayBookings)}
                className={`min-h-[90px] md:min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  hasBookings ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''
                }`}
                style={{
                  backgroundColor: isToday ? 'var(--accent-light)' : 'var(--bg-card)',
                  borderColor: isToday ? 'var(--accent)' : 'var(--border)',
                }}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-blue-600 text-white' : ''
                    }`}
                    style={isToday ? { backgroundColor: 'var(--accent)', color: '#fff' } : { color: 'var(--text-primary)' }}
                  >
                    {day}
                  </span>
                  {hasBookings && (
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                  )}
                </div>

                {/* Day Bookings tags */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayBookings.slice(0, 2).map(b => (
                    <div
                      key={b._id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate text-white"
                      style={{
                        backgroundColor: b.status === 'confirmed' ? '#2563eb' : '#eab308'
                      }}
                      title={`${b.property?.title} - ${b.client?.name}`}
                    >
                      {b.client?.name?.split(' ')[0]} · {b.property?.title?.slice(0, 10)}...
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-[9px] font-bold text-center" style={{ color: 'var(--accent)' }}>
                      +{dayBookings.length - 2} autre(s)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal / Sidebar */}
      {selectedDayBookings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="card p-6 md:p-8 max-w-lg w-full rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <button
              onClick={() => setSelectedDayBookings(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <CalendarIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Réservations du {selectedDateStr}
              </h2>
            </div>

            <div className="space-y-4">
              {selectedDayBookings.map(b => (
                <div
                  key={b._id}
                  className="p-4 rounded-xl border space-y-3"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {b.property?.title}
                    </span>
                    <span className={b.status === 'confirmed' ? 'badge-confirmed text-xs' : 'badge-pending text-xs'}>
                      {b.status === 'confirmed' ? 'Confirmée' : 'En attente'}
                    </span>
                  </div>

                  <div className="text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                      Voyageur : <strong style={{ color: 'var(--text-primary)' }}>{b.client?.name}</strong> ({b.guests} pers.)
                    </p>
                    {b.client?.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {b.client.email}
                      </p>
                    )}
                    {b.client?.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {b.client.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 pt-1">
                      <CalendarIcon className="w-3.5 h-3.5" /> Séjour : {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ({b.nights} nuits)
                    </p>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total réservation :</span>
                    <span className="text-base font-extrabold" style={{ color: 'var(--accent)' }}>
                      {formatPrice(b.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
