import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success(t('common.success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const info = [
    { icon: Mail, label: 'Email', value: 'contact@reserverdark.ma' },
    { icon: Phone, label: t('auth.phone'), value: '+212 5 22 XX XX XX' },
    { icon: MapPin, label: t('common.address'), value: 'Casablanca, Maroc' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 py-16 pt-28">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('nav.contact')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>Notre équipe est là pour vous aider</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {info.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden h-48 border" style={{ borderColor: 'var(--border)' }}>
              <iframe
                title="Casablanca Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106804.98!2d-7.65!3d33.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sfr!2sma!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 card p-8">
            {sent ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message envoyé !</h2>
                <p style={{ color: 'var(--text-muted)' }}>Nous vous répondrons dans les 24 heures.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-6 px-6 py-2.5 rounded-xl font-semibold btn-primary text-sm">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {t('auth.name')}
                    </label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      placeholder="Votre nom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {t('auth.email')}
                    </label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      placeholder="email@exemple.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Sujet</label>
                  <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="De quoi s'agit-il ?" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Message</label>
                  <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    placeholder="Votre message..." />
                </div>
                <button type="submit" disabled={loading}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm btn-primary">
                  <Send className="w-4 h-4" />
                  {loading ? t('common.loading') : 'Envoyer le message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
