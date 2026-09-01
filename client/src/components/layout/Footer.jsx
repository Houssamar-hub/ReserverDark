import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Printer } from 'lucide-react';

/* Inline SVG social icons (lucide-react doesn't export brand icons) */
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M4 4l16 16M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M2 3h6.5L22 21h-6.5z" fill="currentColor"/>
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const navLinks = [
    { label: t('nav.properties'), to: '/properties' },
    { label: t('nav.about'),      to: '/about' },
    { label: t('nav.contact'),    to: '/contact' },
    { label: 'Mon compte',        to: '/login' },
  ];

  const serviceLinks = [
    { label: 'Location courte durée', to: '/properties' },
    { label: 'Devenir propriétaire',  to: '/register' },
    { label: 'Comment ça marche',     to: '/about' },
    { label: 'Publier un logement',   to: '/register' },
    { label: 'FAQ',                   to: '/contact' },
  ];

  const contactItems = [
    { Icon: MapPin,  text: '123 Bd Mohammed V, Casablanca, Maroc' },
    { Icon: Mail,    text: 'contact@reserverdark.ma', href: 'mailto:contact@reserverdark.ma' },
    { Icon: Phone,   text: '+212 600 000 000',        href: 'tel:+212600000000' },
    { Icon: Printer, text: '+212 522 000 000' },
  ];

  const socials = [
    { Icon: IconFacebook,  href: '#', label: 'Facebook' },
    { Icon: IconTwitter,   href: '#', label: 'Twitter' },
    { Icon: IconInstagram, href: '#', label: 'Instagram' },
    { Icon: IconYoutube,   href: '#', label: 'Youtube' },
  ];

  return (
    <footer className="mt-auto transition-colors duration-200"
      style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 pb-3"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
              A propos
            </p>
            <Link to="/" className="inline-flex items-center gap-1 select-none mb-3">
              <span className="font-display text-lg font-normal tracking-tight"
                style={{ color: 'var(--text-primary)' }}>Reserver</span>
              <span className="font-display text-lg font-normal"
                style={{ color: 'var(--accent)' }}>Dark</span>
            </Link>
            <p className="text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}>
              La plateforme de reference pour la location courte duree au Maroc.
              Trouvez appartements, villas et riads et louez en toute confiance
              partout au Maroc.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 pb-3"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
              Navigation
            </p>
            <ul className="space-y-3">
              {navLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 pb-3"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
              Services
            </p>
            <ul className="space-y-3">
              {serviceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-5 pb-3"
              style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
              Contact
            </p>
            <ul className="space-y-3">
              {contactItems.map(({ Icon, text, href }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: 'var(--accent)' }} />
                  {href ? (
                    <a href={href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--text-muted)' }}>
                      {text}
                    </a>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col items-center gap-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Copyright {year} Tous droits reserves par ReserverDark
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
                style={{ backgroundColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
