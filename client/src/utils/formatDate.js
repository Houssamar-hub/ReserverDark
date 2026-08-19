import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date, pattern = 'dd MMM yyyy') => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, pattern, { locale: fr });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return formatDate(date, 'dd MMM yyyy HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: fr });
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const isDateInPast = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return parsedDate < new Date();
};