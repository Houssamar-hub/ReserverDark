import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Home, Search, MapPin, Eye, Star, Bed, Bath, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';

export default function MyProperties() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties/owner/my');
      setProperties(res.data.properties || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(p => p.filter(x => x._id !== id));
      toast.success('Logement supprimé avec succès');
    } catch {
      toast.error(t('common.error'));
    }
  };

  const filteredProperties = properties.filter(p => {
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    const matchesSearch =
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.type || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.myProperties')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Vous avez {properties.length} logement(s) enregistré(s) sur votre compte.
          </p>
        </div>

        <Link
          to="/owner/properties/add"
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl font-bold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> {t('nav.addProperty')}
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'Tous', count: properties.length },
            { key: 'approved', label: 'Validés', count: properties.filter(p => p.status === 'approved').length },
            { key: 'pending', label: 'En attente', count: properties.filter(p => p.status === 'pending').length },
            { key: 'rejected', label: 'Rejetés', count: properties.filter(p => p.status === 'rejected').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5"
              style={
                statusFilter === key
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }
              }
            >
              {label}
              <span
                className="px-1.5 py-0.2 text-[10px] rounded-full"
                style={{
                  backgroundColor: statusFilter === key ? 'rgba(255,255,255,0.25)' : 'var(--bg-card)',
                  color: statusFilter === key ? '#fff' : 'var(--text-primary)'
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, ville..."
            className="input pl-10 py-2 text-xs"
          />
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Home className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Aucun logement trouvé
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {statusFilter === 'all'
              ? 'Ajoutez votre premier logement pour commencer à recevoir des réservations.'
              : `Aucun logement avec le statut "${statusFilter}".`}
          </p>
          <Link to="/owner/properties/add" className="btn-primary px-6 py-3 text-sm rounded-xl font-bold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> {t('nav.addProperty')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(p => (
            <div key={p._id} className="card overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col justify-between">
              {/* Image & Badges */}
              <div className="relative h-52 overflow-hidden group">
                <img
                  src={formatImageUrl(p.images?.[0])}
                  onError={handleImageError}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={
                    p.status === 'approved'
                      ? 'badge-confirmed text-xs shadow-sm'
                      : p.status === 'rejected'
                      ? 'badge-cancelled text-xs shadow-sm'
                      : 'badge-pending text-xs shadow-sm'
                  }>
                    {p.status === 'approved' ? 'Validé' : p.status === 'rejected' ? 'Rejeté' : 'En attente'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200">
                    {p.type || 'Logement'}
                  </span>
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white bg-black/60 backdrop-blur-md">
                    {formatPrice(p.pricePerNight)}
                    <span className="text-xs font-normal opacity-80 ml-1">/ nuit</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1 text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    <span className="truncate">{p.city}, Maroc</span>
                  </div>

                  <h3 className="font-bold text-base line-clamp-1 mb-2" style={{ color: 'var(--text-primary)' }}>
                    {p.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.maxGuests} pers.</span>
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.bedrooms} ch.</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.bathrooms} sdb.</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Link
                    to={`/properties/${p._id}`}
                    target="_blank"
                    className="p-2.5 rounded-xl border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    title="Voir l'annonce publique"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/owner/properties/${p._id}/edit`}
                    className="flex-1 btn-secondary text-center py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" /> {t('common.edit')}
                  </Link>

                  <button
                    onClick={() => deleteProperty(p._id)}
                    className="btn-danger p-2.5 rounded-xl flex items-center justify-center"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
