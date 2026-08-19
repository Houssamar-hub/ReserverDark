import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-200 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold gradient-text mb-4">ReserverDark</h3>
            <p className="text-gray-400 text-sm">
              Plateforme de location et réservation de logements au Maroc.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/properties" className="hover:text-white transition-colors">Logements</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Pour les propriétaires</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/register" className="hover:text-white transition-colors">Devenir propriétaire</Link></li>
              <li><Link to="/owner" className="hover:text-white transition-colors">Gérer mes logements</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400">contact@reserverdark.com</p>
            <p className="text-sm text-gray-400">+212 5XX-XXXXXX</p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
          &copy; 2026 ReserverDark. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;