import { Calendar, Users, MapPin, CreditCard } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '../../constants/bookingStatus';

const BookingCard = ({ booking, onStatusChange }) => {
  const statusColor = BOOKING_STATUS_COLORS[booking.status] || 'bg-gray-500/20 text-gray-400';
  const statusLabel = BOOKING_STATUS_LABELS[booking.status] || booking.status;

  return (
    <div className="glass-effect rounded-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
          <img
            src={booking.property?.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'}
            alt={booking.property?.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {booking.property?.title}
              </h3>
              <div className="flex items-center text-gray-400 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {booking.property?.city}, Maroc
              </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-300">
              <Calendar className="w-4 h-4 mr-2 text-primary-400" />
              <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <Users className="w-4 h-4 mr-2 text-primary-400" />
              <span>{booking.guests} voyageurs</span>
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <CreditCard className="w-4 h-4 mr-2 text-primary-400" />
              <span>{formatPrice(booking.totalPrice)}</span>
            </div>
          </div>

          {onStatusChange && booking.status === 'pending' && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onStatusChange('confirmed')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
              >
                Accepter
              </button>
              <button
                onClick={() => onStatusChange('rejected')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
              >
                Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;