import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

export default function Favorites() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, e) => {
    e.preventDefault();
    try {
      await api.delete(`/favorites/${id}`);
      setFavorites(f => f.filter(x => x._id !== id));
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
        {t('nav.favorites')}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        {favorites.length} {t('common.noData') === 'Aucune donnée' ? 'logement(s) en favori' : 'favorite property(ies)'}
      </p>

      {favorites.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('common.noData')}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {t('common.noData') === 'Aucune donnée' ? 'Ajoutez des logements à vos favoris pour les retrouver facilement.' : 'Add properties to your favorites to find them easily.'}
          </p>
          <Link to="/properties" className="btn-primary px-6 py-3 text-sm">
            Explorer les logements
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ _id, property }) => property && (
            <Link key={_id} to={`/properties/${property._id}`} className="card overflow-hidden card-hover relative block">
              <div className="relative h-52">
                <img src={property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'} alt={property.title}
                  className="w-full h-full object-cover" />
                <button onClick={(e) => removeFavorite(_id, e)}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-600 rounded-full transition-all">
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-white" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold truncate flex-1" style={{ color: 'var(--text-primary)' }}>{property.title}</h3>
                  {property.averageRating > 0 && (
                    <div className="flex items-center text-yellow-500 ml-2">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-semibold ml-1">{property.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--text-muted)' }}>
                  <MapPin className="w-3 h-3" /> {property.city}, Maroc
                </p>
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-primary-600 dark:text-primary-400 font-extrabold">{formatPrice(property.pricePerNight)}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('property.perNight')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
