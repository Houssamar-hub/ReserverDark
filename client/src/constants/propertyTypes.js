export const PROPERTY_TYPES = [
  'Appartement',
  'Villa',
  'Maison',
  'Studio',
  'Chambre',
  'Riad',
  'Autre',
];

export const PROPERTY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNAVAILABLE: 'unavailable',
};

export const PROPERTY_STATUS_LABELS = {
  [PROPERTY_STATUS.PENDING]: 'En attente',
  [PROPERTY_STATUS.APPROVED]: 'Approuvé',
  [PROPERTY_STATUS.REJECTED]: 'Refusé',
  [PROPERTY_STATUS.UNAVAILABLE]: 'Indisponible',
};

export const PROPERTY_STATUS_COLORS = {
  [PROPERTY_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-500',
  [PROPERTY_STATUS.APPROVED]: 'bg-green-500/20 text-green-500',
  [PROPERTY_STATUS.REJECTED]: 'bg-red-500/20 text-red-500',
  [PROPERTY_STATUS.UNAVAILABLE]: 'bg-gray-500/20 text-gray-400',
};