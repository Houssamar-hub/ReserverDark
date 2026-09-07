import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RotateCcw, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropertyCard from '../../components/property/PropertyCard';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Agadir', 'Fès', 'Tanger', 'Meknès', 'Oujda', 'Tétouan', 'Essaouira'];
const AMENITIES = ['WiFi', 'Piscine', 'Climatisation', 'Cuisine', 'Parking', 'Jardin'];

export default function Properties() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    amenities: [],
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters, page, searchQuery]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
      filters.amenities.forEach(a => params.append('amenities', a));
      
      const res = await api.get(`/properties?${params}`);
      setProperties(res.data.properties || []);
      setTotal(res.data.pagination?.total || res.data.total || (res.data.properties ? res.data.properties.length : 0));
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
    setSearchQuery('');
    setPage(1);
  };

  const activeFiltersCount = 
    (filters.city ? 1 : 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    filters.amenities.length;

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        
        {/* Header with Title & Search Bar + Filter Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {t('nav.properties')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {total} {t('common.noData') === 'Aucune donnée' ? 'logements trouvés' : 'properties found'}
            </p>
          </div>

          {/* Search bar + Filter toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search input bar */}
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Rechercher par nom, ville, quartier..."
                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  title="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-xs ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
              style={showFilters || activeFiltersCount > 0 ? {} : { color: 'var(--text-primary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('common.filter')}</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-blue-600 text-xs font-bold leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel / Window */}
        {showFilters && (
          <div
            className="card p-6 mb-8 rounded-2xl border shadow-md animate-fade-in relative transition-all"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {/* Filter Window Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  {t('common.filter')} avancés
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Réinitialiser</span>
                  </button>
                )}

                {/* Close window button */}
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 rounded-xl border hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1.5 px-3 text-xs font-semibold"
                  style={{ borderColor: 'var(--border)' }}
                  aria-label="Fermer cette fenêtre"
                >
                  <X className="w-4 h-4 text-red-500" />
                  <span>Fermer</span>
                </button>
              </div>
            </div>

            {/* Filter Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('common.city')}
                </label>
                <select
                  value={filters.city}
                  onChange={e => { setFilters(f => ({ ...f, city: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="">{t('common.all')}</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Prix min (MAD)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Prix max (MAD)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="5000"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  {t('property.bedrooms')}
                </label>
                <input
                  type="number"
                  value={filters.bedrooms}
                  onChange={e => { setFilters(f => ({ ...f, bedrooms: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Amenities Section */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <label className="block text-xs font-semibold mb-2.5" style={{ color: 'var(--text-muted)' }}>
                {t('property.amenities')}
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => {
                  const isSelected = filters.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-end gap-3" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Appliquer les filtres ({total} résultats)</span>
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : properties.length === 0 ? (
          <div className="card text-center py-20 p-8 rounded-2xl">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('common.noData')}
            </h3>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
              Aucun logement ne correspond à vos critères de recherche. Essayez d'élargir vos filtres.
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
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
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                  p === page
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
                style={p === page ? {} : { backgroundColor: 'var(--bg-card)' }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
