import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, Building2, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function OwnerProfile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [propertyCount, setPropertyCount] = useState(0);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    api.get('/properties/owner/my')
      .then(res => setPropertyCount(res.data.properties?.length || 0))
      .catch(() => {});
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await api.post('/users/avatar', fd);
      updateUser({ ...user, avatar: res.data.avatar });
      toast.success('Photo de profil mise à jour !');
    } catch {
      toast.error('Erreur lors du téléversement de l’avatar');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profil mis à jour avec succès !');
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Mot de passe modifié avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
          {t('nav.profile')} Propriétaire
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Gérez vos informations personnelles et vos paramètres de sécurité.
        </p>
      </div>

      {/* Avatar & Summary Card */}
      <div className="card p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-md"
            style={{ backgroundColor: 'var(--accent)' }}>
            {avatarPreview || user?.avatar ? (
              <img src={avatarPreview || user?.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.name || 'P')[0].toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer shadow-lg transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="text-center sm:text-left flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </h2>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0"
              style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Compte Propriétaire Vérifié
            </span>
          </div>

          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>

          <div className="flex flex-wrap gap-4 pt-2 justify-center sm:justify-start text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              {propertyCount} logement(s) enregistré(s)
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          Informations personnelles
        </h2>

        <form onSubmit={handleProfileSave} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('auth.name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('auth.phone')} (utilisé pour les contacts avec les voyageurs)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="tel"
                value={profileForm.phone}
                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+212 600 000 000"
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={loading}
              className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {t('common.save')}
            </Button>
          </div>
        </form>
      </div>

      {/* Security / Password Form */}
      <div className="card p-6 md:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Lock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          Sécurité du compte & Mot de passe
        </h2>

        <form onSubmit={handlePasswordSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('auth.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              loading={pwLoading}
              className="btn-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Mettre à jour le mot de passe
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
