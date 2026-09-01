import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropertyCard from '../../components/property/PropertyCard';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Agadir', 'Fès', 'Tanger', 'Meknès', 'Oujda', 'Tétouan', 'Essaouira'];
const AMENITIES = ['WiFi', 'Piscine', 'Climatisation', 'Cuisine', 'Parking', 'Jardin'];

export default function Properties() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [],
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [filters, page]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      filters.amenities.forEach(a => params.append('amenities', a));
      const res = await api.get(`/properties?${params}`);
      setProperties(res.data.properties || []);
      setTotal(res.data.pagination?.total || res.data.total || 0);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (a) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ city: '', minPrice: '', maxPrice: '', bedrooms: '', amenities: [] });
    setPage(1);
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('nav.properties')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {total} {t('common.noData') === 'Aucune donnée' ? 'logements trouvés' : 'properties found'}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-semibold transition-all hover:bg-gray-100 dark:hover:bg-white/10"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
            <SlidersHorizontal className="w-4 h-4" /> {t('common.filter')}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('common.filter')}
              </h3>
              <button onClick={clearFilters} className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                <X className="w-3 h-3" /> {t('common.cancel')}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('common.city')}</label>
                <select value={filters.city} onChange={e => { setFilters(f => ({ ...f, city: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">{t('common.all')}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Prix min (MAD)</label>
                <input type="number" value={filters.minPrice} onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="0" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Prix max (MAD)</label>
                <input type="number" value={filters.maxPrice} onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{t('property.bedrooms')}</label>
                <input type="number" value={filters.bedrooms} onChange={e => { setFilters(f => ({ ...f, bedrooms: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="1" min="1" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{t('property.amenities')}</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all ${
                      filters.amenities.includes(a)
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('common.noData')}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  p === page
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
