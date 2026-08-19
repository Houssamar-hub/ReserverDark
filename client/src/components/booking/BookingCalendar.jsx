import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

const BookingCalendar = ({ bookings = [], onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty days before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateBooked = (date) => {
    return bookings.some(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut;
    });
  };

  const isDatePast = (date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {formatDate(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}

        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2"></div>;
          }

          const booked = isDateBooked(date);
          const past = isDatePast(date);
          const today = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={date.toString()}
              onClick={() => onDateSelect?.(date)}
              disabled={past}
              className={`
                p-2 rounded-lg text-center transition-colors
                ${past ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}
                ${booked ? 'bg-red-500/20 text-red-400' : ''}
                ${today ? 'border border-primary-500' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500/20 rounded"></div>
          <span className="text-sm text-gray-400">Réservé</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500/20 rounded"></div>
          <span className="text-sm text-gray-400">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-primary-500 rounded"></div>
          <span className="text-sm text-gray-400">Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;