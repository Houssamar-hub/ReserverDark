import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, Home, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'client' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFieldErrors(fe => ({ ...fe, [field]: '' }));
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nom requis';
    if (!form.email.trim()) errs.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (!form.phone.trim()) errs.phone = 'Téléphone requis';
    if (!form.password) errs.password = 'Mot de passe requis';
    else if (form.password.length < 6) errs.password = 'Minimum 6 caractères';
    if (!form.confirmPassword) errs.confirmPassword = 'Confirmation requise';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role });
      if (data.user?.role === 'owner') navigate('/owner');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${
      fieldErrors[field]
        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5'
    }`;

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Trop court', color: 'bg-red-500', width: '25%' };
    if (p.length < 8 || !/[A-Z]/.test(p)) return { label: 'Faible', color: 'bg-orange-400', width: '50%' };
    if (!/[0-9]/.test(p)) return { label: 'Moyen', color: 'bg-yellow-400', width: '75%' };
    return { label: 'Fort', color: 'bg-green-500', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 transition-colors"
      style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 font-black text-lg">R</span>
            </span>
            <span className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>ReserverDark</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Créez votre compte gratuitement</p>
        </div>

        {/* Card */}
        <div className="card p-8">

          {/* Global error alert */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
            </div>
          )}

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: 'client', label: t('auth.role.client'), icon: Users },
              { value: 'owner',  label: t('auth.role.owner'),  icon: Home  },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setForm(f => ({ ...f, role: value }))}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
                style={{ color: form.role === value ? undefined : 'var(--text-muted)' }}>
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={set('name')}
                  className={inputClass('name')} style={{ color: 'var(--text-primary)' }}
                  placeholder="Votre nom complet" />
              </div>
              {fieldErrors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={set('email')}
                  className={inputClass('email')} style={{ color: 'var(--text-primary)' }}
                  placeholder="email@exemple.com" />
              </div>
              {fieldErrors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.phone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={set('phone')}
                  className={inputClass('phone')} style={{ color: 'var(--text-primary)' }}
                  placeholder="+212 6XX XXX XXX" />
              </div>
              {fieldErrors.phone && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className={inputClass('password')} style={{ color: 'var(--text-primary)' }}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Sécurité : <span className="font-medium">{strength.label}</span></p>
                </div>
              )}
              {fieldErrors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={inputClass('confirmPassword')} style={{ color: 'var(--text-primary)' }}
                  placeholder="••••••••" />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 btn-primary flex items-center justify-center gap-2 mt-2">
              {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Création...' : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
