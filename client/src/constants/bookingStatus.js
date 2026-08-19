export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'En attente',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmée',
  [BOOKING_STATUS.REJECTED]: 'Refusée',
  [BOOKING_STATUS.CANCELLED]: 'Annulée',
  [BOOKING_STATUS.COMPLETED]: 'Terminée',
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-500',
  [BOOKING_STATUS.CONFIRMED]: 'bg-green-500/20 text-green-500',
  [BOOKING_STATUS.REJECTED]: 'bg-red-500/20 text-red-500',
  [BOOKING_STATUS.CANCELLED]: 'bg-gray-500/20 text-gray-400',
  [BOOKING_STATUS.COMPLETED]: 'bg-blue-500/20 text-blue-500',
};