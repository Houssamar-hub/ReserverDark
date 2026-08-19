export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatPricePerNight = (price) => {
  return `${formatPrice(price)} / nuit`;
};