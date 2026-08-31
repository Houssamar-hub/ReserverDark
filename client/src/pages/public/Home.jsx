import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, ArrowRight, Home, Users, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropertyCard from '../../components/property/PropertyCard';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

export default function HomePage() {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/properties?limit=6&status=active')
      .then(res => setProperties(res.data.properties || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cities = ['Casablanca', 'Marrakech', 'Rabat', 'Agadir', 'Fès', 'Tanger'];

  const stats = [
    { label: t('home.stats.cities'),     value: '20+' },
    { label: t('home.stats.properties'), value: '500+' },
    { label: t('home.stats.clients'),    value: '10K+' },
    { label: 'Propriétaires',            value: '200+' },
  ];

  const steps = [
    { step: '1', icon: Search, title: t('home.steps.search.title'), desc: t('home.steps.search.desc') },
    { step: '2', icon: Home,   title: t('home.steps.book.title'),   desc: t('home.steps.book.desc') },
    { step: '3', icon: Shield, title: t('home.steps.enjoy.title'),  desc: t('home.steps.enjoy.desc') },
  ];

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with dark/light overlay */}
        <div className="absolute inset-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">


          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t('home.hero.title').split('Maroc')[0]}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-white">
              {t('home.hero.title').includes('Maroc') ? 'Maroc' : ''}
            </span>
          </h1>

          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('home.hero.cityPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all" />
            </div>
            <Link to={`/properties${search ? `?city=${search}` : ''}`}
              className="px-7 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 text-sm">
              {t('home.hero.search')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick city links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {cities.map(city => (
              <Link key={city} to={`/properties?city=${city}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/80 hover:text-white text-sm transition-all flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {city}
              </Link>
            ))}
          </div>
        </div>


      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="py-16 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured properties ───────────────────────────────── */}
      <div className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('home.featured')}</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Les plus appréciés par nos voyageurs</p>
          </div>
          <Link to="/properties" className="flex items-center gap-2 text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Aucun logement disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </div>

      {/* ── How it works ─────────────────────────────────────── */}
      <div className="py-20 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{t('home.howItWorks')}</h2>
          <p className="mb-12 text-sm" style={{ color: 'var(--text-muted)' }}>Simple, rapide et sécurisé</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="card p-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
                  {step}
                </div>
                <Icon className="w-10 h-10 text-primary-500 mx-auto mb-4 mt-2" />
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <div className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Vous êtes propriétaire ?</h2>
          <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Publiez votre logement et commencez à gagner de l'argent dès aujourd'hui.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all">
            <Users className="w-5 h-5" /> Devenir propriétaire
          </Link>
        </div>
      </div>
    </div>
  );
}
