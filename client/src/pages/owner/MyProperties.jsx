import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

export default function MyProperties() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/owner/properties');
      setProperties(res.data.properties || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    if (!confirm(t('common.confirm') + '?')) return;
    try {
      await api.delete(`/owner/properties/${id}`);
      setProperties(p => p.filter(x => x._id !== id));
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const statusColors = {
    pending: 'badge-pending',
    active: 'badge-active',
    rejected: 'badge-cancelled'
  };

  const statusLabels = {
    pending: t('property.pending'),
    active: t('property.active'),
    rejected: t('property.rejected')
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            {t('nav.myProperties')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {properties.length} {t('common.noData') === 'Aucune donnée' ? 'logement(s)' : 'property(ies)'}
          </p>
        </div>
        <Link to="/owner/properties/add" className="btn-primary flex items-center gap-2 px-4 py-2 text-sm rounded-xl">
          <Plus className="w-4 h-4" /> {t('common.add')}
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Home className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('common.noData')}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            {t('common.noData') === 'Aucune donnée' ? 'Ajoutez votre premier logement pour commencer.' : 'Add your first property to start.'}
          </p>
          <Link to="/owner/properties/add" className="btn-primary px-6 py-3 text-sm">
            {t('nav.addProperty')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p._id} className="card overflow-hidden">
              <div className="relative h-48">
                <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'} alt={p.title}
                  className="w-full h-full object-cover" />
                <span className={`absolute top-3 right-3 ${statusColors[p.status] || statusColors.pending}`}>
                  {statusLabels[p.status] || p.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1 truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{p.city}, Maroc</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-extrabold text-primary-600 dark:text-primary-400">
                    {formatPrice(p.pricePerNight)}
                    <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{t('property.perNight')}</span>
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {p.bedrooms} {t('property.bedrooms')} · {p.bathrooms} {t('property.bathrooms')}
                  </span>
                </div>
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Link to={`/owner/properties/${p._id}/edit`}
                    className="flex-1 btn-secondary text-center py-2 text-xs rounded-xl flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> {t('common.edit')}
                  </Link>
                  <button onClick={() => deleteProperty(p._id)}
                    className="flex-1 btn-danger text-center py-2 text-xs rounded-xl flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> {t('common.delete')}
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
