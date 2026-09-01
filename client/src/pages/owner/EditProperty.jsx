import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Building2, MapPin, DollarSign, Users, Bed, Bath,
  Plus, Trash2, ArrowLeft, Image as ImageIcon, Check, Save, Sparkles
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CITIES = ['Casablanca', 'Marrakech', 'Rabat', 'Agadir', 'Fès', 'Tanger', 'Essaouira', 'Chefchaouen', 'Ouarzazate', 'Meknès'];
const PROPERTY_TYPES = ['Appartement', 'Villa', 'Maison', 'Studio', 'Chambre', 'Riad', 'Autre'];
const AVAILABLE_AMENITIES = [
  'WiFi', 'Climatisation', 'Piscine', 'Parking gratuit', 'Cuisine équipée',
  'Télévision', 'Lave-linge', 'Balcon / Terrasse', 'Vue sur mer', 'Jacuzzi',
  'Ascenseur', 'Chauffage', 'Espace de travail', 'Animaux acceptés'
];

export default function EditProperty() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Appartement',
    pricePerNight: '',
    city: 'Casablanca',
    address: '',
    location: '',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    status: 'pending'
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const res = await api.get(`/properties/${id}`);
      const prop = res.data.property;
      if (prop) {
        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          type: prop.type || 'Appartement',
          pricePerNight: prop.pricePerNight || '',
          city: prop.city || 'Casablanca',
          address: prop.address || '',
          location: prop.location || '',
          maxGuests: prop.maxGuests || 2,
          bedrooms: prop.bedrooms || 1,
          bathrooms: prop.bathrooms || 1,
          amenities: prop.amenities || [],
          images: prop.images || [],
          status: prop.status || 'pending'
        });
      }
    } catch {
      toast.error('Impossible de charger les données du logement');
      navigate('/owner/properties');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.address.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (Number(formData.pricePerNight) <= 0) {
      toast.error('Le prix par nuit doit être supérieur à 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        maxGuests: Number(formData.maxGuests),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        location: formData.location || `${formData.address}, ${formData.city}`
      };

      await api.put(`/properties/${id}`, payload);
      toast.success('Logement mis à jour avec succès !');
      navigate('/owner/properties');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/owner/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-2 transition-colors hover:underline"
            style={{ color: 'var(--accent)' }}>
            <ArrowLeft className="w-4 h-4" /> {t('nav.myProperties')}
          </Link>
          <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Modifier le logement
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Mettez à jour les informations et photos de votre bien.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <span className={
            formData.status === 'approved'
              ? 'badge-confirmed text-xs px-3 py-1.5'
              : formData.status === 'rejected'
              ? 'badge-cancelled text-xs px-3 py-1.5'
              : 'badge-pending text-xs px-3 py-1.5'
          }>
            Statut : {formData.status === 'approved' ? 'Validé' : formData.status === 'rejected' ? 'Rejeté' : 'En attente'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Informations Générales */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Building2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Informations générales
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Titre de l'annonce <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Type de bien <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input cursor-pointer"
                >
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Ville <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input cursor-pointer"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Adresse complète <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Quartier / Repère (optionnel)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Tarification & Capacité */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Tarification et capacité
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Prix / nuit (MAD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerNight"
                required
                min="1"
                value={formData.pricePerNight}
                onChange={handleChange}
                className="input font-bold"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Voyageurs max <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  name="maxGuests"
                  required
                  min="1"
                  max="50"
                  value={formData.maxGuests}
                  onChange={handleChange}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Chambres <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  name="bedrooms"
                  required
                  min="0"
                  max="20"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Salles de bain <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Bath className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  name="bathrooms"
                  required
                  min="0"
                  max="20"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Équipements */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Commodités & Équipements
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {AVAILABLE_AMENITIES.map(amenity => {
              const isChecked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition-all text-left border"
                  style={{
                    backgroundColor: isChecked ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    borderColor: isChecked ? 'var(--accent)' : 'var(--border)',
                    color: isChecked ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  <div className="w-4 h-4 rounded flex items-center justify-center border"
                    style={{
                      backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                      borderColor: isChecked ? 'var(--accent)' : 'var(--border)'
                    }}>
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="truncate">{amenity}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ImageIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Photos du logement
          </h2>

          <div className="flex gap-2 mb-6">
            <input
              type="url"
              value={newImageUrl}
              onChange={e => setNewImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="input flex-1"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
            />
            <button
              type="button"
              onClick={addImage}
              className="btn-primary flex items-center gap-2 px-5 py-3 rounded-xl whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </div>

          {formData.images.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-2xl" style={{ borderColor: 'var(--border)' }}>
              <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune photo pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden aspect-video border"
                  style={{ borderColor: 'var(--border)' }}>
                  <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                      title="Supprimer la photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                      Couverture
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/owner/properties"
            className="btn-secondary px-6 py-3 rounded-xl text-sm font-semibold"
          >
            {t('common.cancel')}
          </Link>
          <Button
            type="submit"
            loading={loading}
            className="btn-primary px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
