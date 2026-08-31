import { Shield, Heart, Globe, Award, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  const team = [
    { name: 'Youssef El Amrani', role: 'Fondateur & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Fatima Zahra', role: 'Directrice Produit', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Karim Benali', role: 'Directeur Technique', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  ];

  const features = [
    { icon: Shield, title: 'Paiements sécurisés', desc: 'Transactions 100% sécurisées avec protection acheteur.' },
    { icon: Heart, title: 'Logements vérifiés', desc: 'Chaque logement est vérifié par notre équipe.' },
    { icon: Globe, title: 'Partout au Maroc', desc: 'Plus de 20 villes disponibles sur toute l\'étendue du royaume.' },
    { icon: Award, title: 'Meilleur rapport qualité-prix', desc: 'Des prix compétitifs sans frais cachés.' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Hero */}
      <div className="relative py-24 text-center overflow-hidden border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-8">
          <h1 className="text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
            {t('nav.about')}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Nous sommes la plateforme de référence pour la location de logements au Maroc. Notre mission est de connecter les voyageurs avec des propriétaires de confiance pour des expériences inoubliables.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['2022', 'Année de création'], ['500+', t('home.stats.properties')], ['10K+', t('home.stats.clients')], ['4.8', 'Note moyenne']].map(([val, label]) => (
            <div key={label}>
              <div className="text-4xl font-extrabold mb-1" style={{ color: 'var(--text-primary)' }}>{val}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Notre mission</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>Rendre la location de logements au Maroc accessible, transparente et sécurisée pour tous. Que vous soyez voyageur ou propriétaire, nous vous offrons une expérience sans effort.</p>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>ReserverDark croit en un tourisme durable et en des relations durables entre hôtes et voyageurs basées sur la confiance mutuelle.</p>
          </div>
          <div className="card p-8 text-center">
            <Globe className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Vision 2030</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Devenir la plateforme de référence de l'hébergement touristique au Maghreb avec plus de 5000 logements dans 50 villes.</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 border-t border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>Pourquoi nous choisir ?</h2>
          <p className="text-center mb-12 text-sm" style={{ color: 'var(--text-muted)' }}>Ce qui nous distingue</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 text-center">
                <Icon className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-20 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--text-primary)' }}>Notre équipe</h2>
        <p className="text-center mb-12 text-sm" style={{ color: 'var(--text-muted)' }}>Les personnes derrière ReserverDark</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {team.map(({ name, role, img }) => (
            <div key={name} className="card p-6 text-center">
              <img src={img} alt={name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-primary-500" />
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{name}</h3>
              <p className="text-sm font-semibold text-primary-500">{role}</p>
              <div className="flex justify-center gap-1 mt-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
