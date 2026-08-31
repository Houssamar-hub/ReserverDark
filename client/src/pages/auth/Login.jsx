import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');          // inline alert
  const [fieldErrors, setFieldErrors] = useState({});  // per-field errors

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t('auth.email') + ' requis';
    if (!form.password.trim()) errs.password = t('auth.password') + ' requis';
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
      const data = await login(form);
      const role = data.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'owner') navigate('/owner');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
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
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('auth.hasAccount') === t('auth.hasAccount') ? 'Connectez-vous à votre compte' : ''}
            Connectez-vous à votre compte
          </p>
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

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); setFieldErrors(f => ({ ...f, email: '' })); setError(''); }}
                  className={inputClass('email')}
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="email@exemple.com"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); setFieldErrors(f => ({ ...f, password: '' })); setError(''); }}
                  className={inputClass('password')}
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 btn-primary flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Connexion...' : t('auth.login')}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold">
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
