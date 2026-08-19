import { Link } from 'react-router-dom';
import { MapPin, Star, Users, Bed, Bath } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/properties/${property._id}`}>
      <div className="glass-effect rounded-2xl overflow-hidden card-hover">
        <div className="relative h-56">
          <img
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          {property.status === 'pending' && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/90 text-white text-sm rounded-lg">
              En attente
            </span>
          )}
          {property.status === 'rejected' && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-red-500/90 text-white text-sm rounded-lg">
              Refusé
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{property.title}</h3>
            {property.averageRating > 0 && (
              <div className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm">{property.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center text-gray-400 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.city}, Maroc</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{property.maxGuests} pers.</span>
            </div>
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} ch.</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} sdb</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-xl font-bold text-primary-400">
              {formatPrice(property.pricePerNight)}
            </span>
            <span className="text-sm text-gray-400">/ nuit</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;