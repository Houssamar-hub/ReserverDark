import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Globe, LogOut, Menu, X, LayoutDashboard, ChevronDown } from 'lucide-react';

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',  flag: '🇸🇦' },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const dashboardPath = user
    ? user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/client'
    : '/login';

  const currentLang = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <span className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-gray-900 text-sm font-black">R</span>
            </span>
            ReserverDark
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/properties" className="text-sm font-medium transition-colors hover:text-primary-500"
              style={{ color: 'var(--text-muted)' }}>
              {t('nav.properties')}
            </Link>
            <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary-500"
              style={{ color: 'var(--text-muted)' }}>
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary-500"
              style={{ color: 'var(--text-muted)' }}>
              {t('nav.contact')}
            </Link>

            {user && (
              <Link to={dashboardPath} className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-500"
                style={{ color: 'var(--text-muted)' }}>
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </Link>
            )}
          </div>

          {/* Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}>
                <span>{currentLang.flag}</span>
                <span>{currentLang.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 rounded-xl shadow-xl z-50 overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => changeLang(l.code)}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/10 ${i18n.language === l.code ? 'font-semibold text-primary-500' : ''}`}
                      style={{ color: i18n.language === l.code ? undefined : 'var(--text-muted)' }}>
                      <span>{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-white/10"
              title={isDark ? t('theme.light') : t('theme.dark')}
              style={{ color: 'var(--text-muted)' }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth buttons */}
            {user ? (
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all btn-primary">
                <LogOut className="w-4 h-4" />
                {t('nav.logout')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-xl transition-all btn-secondary"
                  style={{ color: 'var(--text-primary)' }}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold rounded-xl transition-all btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
          <div className="px-4 py-4 space-y-2">
            {[
              { to: '/properties', label: t('nav.properties') },
              { to: '/about', label: t('nav.about') },
              { to: '/contact', label: t('nav.contact') },
              ...(user ? [{ to: dashboardPath, label: t('nav.dashboard') }] : []),
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-white/10"
                style={{ color: 'var(--text-muted)' }}>
                {label}
              </Link>
            ))}

            {/* Language switcher mobile */}
            <div className="border-t pt-3 mt-3 flex gap-2 flex-wrap" style={{ borderColor: 'var(--border)' }}>
              {LANGS.map(l => (
                <button key={l.code} onClick={() => { changeLang(l.code); setMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${i18n.language === l.code ? 'btn-primary' : 'btn-secondary'}`}>
                  {l.flag} {l.code.toUpperCase()}
                </button>
              ))}
            </div>

            {user ? (
              <button onClick={handleLogout} className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold mt-2 flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> {t('nav.logout')}
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 btn-secondary rounded-xl text-sm font-medium">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 btn-primary rounded-xl text-sm font-semibold">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close lang dropdown on outside click */}
      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
    </nav>
  );
};

export default Navbar;