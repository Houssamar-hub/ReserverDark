import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Bed, Bath } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/formatPrice';

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();

  return (
    <Link to={`/properties/${property._id}`}>
      <div className="card-hover overflow-hidden rounded-2xl">
        <div className="relative h-56">
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {property.status === 'pending' && (
            <span className="absolute top-4 right-4 badge-pending">
              {t('property.pending')}
            </span>
          )}
          {property.status === 'rejected' && (
            <span className="absolute top-4 right-4 badge-cancelled">
              {t('property.rejected')}
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>{property.title}</h3>
            {property.averageRating > 0 && (
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm font-semibold">{property.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.city}, Maroc</span>
          </div>

          <div className="flex items-center gap-4 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{property.maxGuests} {t('property.guests')}</span>
            </div>
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} {t('property.bedrooms')}</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} {t('property.bathrooms')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(property.pricePerNight)}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('property.perNight')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;