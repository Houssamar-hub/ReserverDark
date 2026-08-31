import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Email envoyé !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">ReserverDark</h1>
          <p className="text-gray-400">Réinitialisation du mot de passe</p>
        </div>
        <div className="glass-effect rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Email envoyé !</h2>
              <p className="text-gray-400 mb-6">Vérifiez votre boîte mail et suivez les instructions pour réinitialiser votre mot de passe.</p>
              <Link to="/login" className="text-primary-400 hover:text-primary-300 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-400 mb-6">Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      placeholder="email@exemple.com" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all">
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-300 mt-6">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
