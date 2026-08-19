import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-200/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">ReserverDark</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/properties" className="text-gray-300 hover:text-white transition-colors">
              Logements
            </Link>
            
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/client'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-200 border-b border-white/10">
          <div className="px-4 py-3 space-y-3">
            <Link to="/properties" className="block text-gray-300 hover:text-white transition-colors">
              Logements
            </Link>
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/client'} 
                      className="block text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-gray-300 hover:text-white transition-colors w-full text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-center">
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;