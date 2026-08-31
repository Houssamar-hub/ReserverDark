import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
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
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', profileForm);
      updateUser(res.data.user);
      toast.success(t('common.success'));
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
      await api.put('/users/password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('common.success'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-8" style={{ color: 'var(--text-primary)' }}>
        {t('nav.profile')}
      </h1>

      {/* Avatar Card */}
      <div className="card p-6 mb-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
            {avatarPreview || user?.avatar ? (
              <img src={avatarPreview || user?.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.name || 'U')[0].toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <span className="mt-2 inline-block px-2.5 py-0.5 bg-primary-50 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400 text-xs font-semibold rounded-full capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Profile Info Form */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <User className="w-5 h-5 text-primary-500" /> {t('common.edit') === 'Modifier' ? 'Informations personnelles' : 'Personal Information'}
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          {[
            { field: 'name', label: t('auth.name'), icon: User, type: 'text' },
            { field: 'email', label: t('auth.email'), icon: Mail, type: 'email' },
            { field: 'phone', label: t('auth.phone'), icon: Phone, type: 'tel' },
          ].map(({ field, label, icon: Icon, type }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={type} value={profileForm[field]} onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          ))}
          <Button type="submit" loading={loading} className="btn-primary py-2.5 rounded-xl font-bold text-sm mt-2 flex items-center gap-2">
            <Save className="w-4 h-4" /> {t('common.save')}
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Lock className="w-5 h-5 text-primary-500" /> {t('common.edit') === 'Modifier' ? 'Changer le mot de passe' : 'Change Password'}
        </h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          {[
            { field: 'currentPassword', label: 'Mot de passe actuel' },
            { field: 'newPassword', label: 'Nouveau mot de passe' },
            { field: 'confirmPassword', label: t('auth.confirmPassword') },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={passwordForm[field]} onChange={e => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
          ))}
          <Button type="submit" loading={pwLoading} className="btn-primary py-2.5 rounded-xl font-bold text-sm mt-2 flex items-center gap-2">
            <Save className="w-4 h-4" /> {t('common.save')}
          </Button>
        </form>
      </div>
    </div>
  );
}
