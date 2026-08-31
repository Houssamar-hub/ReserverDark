import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Users, Bed, Bath, 
  Heart, MessageSquare, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';
import Rating from '../../components/review/Rating';
import ReviewCard from '../../components/review/ReviewCard';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchProperty();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      toast.error(t('common.error'));
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get(`/favorites/check/${id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error(t('auth.noAccount') === 'Pas encore de compte ?' ? 'Connectez-vous pour ajouter aux favoris' : 'Login to add to favorites');
      navigate('/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success(t('common.success'));
      } else {
        await api.post('/favorites', { propertyId: id });
        setIsFavorite(true);
        toast.success(t('common.success'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('auth.noAccount') === 'Pas encore de compte ?' ? 'Connectez-vous pour réserver' : 'Login to book');
      navigate('/login');
      return;
    }
    if (user.role === 'owner') {
      toast.error('Vous ne pouvez pas réserver en tant que propriétaire');
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/bookings', {
        propertyId: id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
      });
      toast.success(t('common.success'));
      navigate('/client/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto p-4 py-8 pt-24">
        {/* Gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-8 border" style={{ borderColor: 'var(--border)' }}>
          <div className="h-[400px] md:h-[600px]">
            <img
              src={property.images?.[currentImage] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200'}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {property.images?.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => setCurrentImage((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          <button
            onClick={toggleFavorite}
            disabled={favoriteLoading}
            className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{property.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.city}, Maroc
                </div>
                {property.averageRating > 0 && (
                  <div className="flex items-center text-yellow-500">
                    <Rating value={property.averageRating} size="sm" />
                    <span className="ml-1 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{property.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                <span style={{ color: 'var(--text-primary)' }}>{property.maxGuests} {t('property.guests')} max</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-primary-500" />
                <span style={{ color: 'var(--text-primary)' }}>{property.bedrooms} {t('property.bedrooms')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5 text-primary-500" />
                <span style={{ color: 'var(--text-primary)' }}>{property.bathrooms} {t('property.bathrooms')}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('property.description')}</h2>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{property.description}</p>
            </div>

            {property.amenities?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('property.amenities')}</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 rounded-lg text-sm border"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t('property.reviews')}</h2>
              {property.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {property.reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>{t('common.noData')}</p>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                  {formatPrice(property.pricePerNight)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('property.perNight')}</span>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {t('property.checkIn')}
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {t('property.checkOut')}
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {t('property.guests')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={property.maxGuests || 10}
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={bookingLoading}
                  className="w-full btn-primary py-3 rounded-xl font-bold text-sm mt-2"
                >
                  {t('property.book')}
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Connectez-vous pour envoyer un message');
                      navigate('/login');
                      return;
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 dark:bg-white/5 border hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors text-sm font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  Contacter le propriétaire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
