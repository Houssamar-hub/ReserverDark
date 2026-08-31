import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="mt-auto transition-colors duration-200" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-gray-900 text-sm font-black">R</span>
              </span>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>ReserverDark</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Plateforme de location de logements au Maroc.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Liens rapides</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link to="/properties" className="hover:text-primary-500 transition-colors">{t('nav.properties')}</Link></li>
              <li><Link to="/about" className="hover:text-primary-500 transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>Propriétaires</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link to="/register" className="hover:text-primary-500 transition-colors">Devenir propriétaire</Link></li>
              <li><Link to="/owner" className="hover:text-primary-500 transition-colors">Gérer mes logements</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-primary)' }}>{t('nav.contact')}</h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>contact@reserverdark.ma</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>+212 5XX-XXXXXX</p>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          © 2026 ReserverDark. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;