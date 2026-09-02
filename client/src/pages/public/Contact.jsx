import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TARGET_EMAIL = 'pchossam11@gmail.com';
const TARGET_PHONE = '0614351030';
const TARGET_PHONE_INTL = '+212614351030';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const createWhatsAppUrl = (data) => {
    const text = `*Nouveau Message depuis ReserverDark*\n\n` +
      `*Nom:* ${data.name || 'Visiteur'}\n` +
      `*Email:* ${data.email || 'Non précisé'}\n` +
      (data.phone ? `*Téléphone:* ${data.phone}\n` : '') +
      `*Sujet:* ${data.subject || 'Demande d\'information'}\n\n` +
      `*Message:*\n${data.message || 'Bonjour, je souhaite vous contacter.'}`;
    return `https://wa.me/212614351030?text=${encodeURIComponent(text)}`;
  };

  const createGmailWebUrl = (data) => {
    const subject = `[ReserverDark] ${data.subject || 'Demande de contact'}`;
    const body = `Bonjour Houssam,\n\nNom: ${data.name || ''}\nEmail: ${data.email || ''}\nTéléphone: ${data.phone || ''}\n\nMessage:\n${data.message || ''}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${TARGET_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Send to backend API (saves in MongoDB Contact collection)
      await api.post('/contact', form);

      setSent(true);
      toast.success('Votre message a été envoyé avec succès !');
    } catch {
      toast.error('Erreur lors de l\'envoi. Vous pouvez nous contacter directement sur WhatsApp ou Gmail.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectWhatsApp = () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast('Veuillez au moins renseigner votre nom et votre message', { icon: 'ℹ️' });
    }
    const url = createWhatsAppUrl(form);
    window.open(url, '_blank');
  };

  const handleDirectGmail = () => {
    if (!form.name.trim() || !form.message.trim()) {
      toast('Veuillez au moins renseigner votre nom et votre message', { icon: 'ℹ️' });
    }
    const url = createGmailWebUrl(form);
    window.open(url, '_blank');
  };

  const handleDirectMailto = () => {
    const subject = encodeURIComponent(`[ReserverDark] ${form.subject || 'Demande de contact'}`);
    const body = encodeURIComponent(`Nom: ${form.name || ''}\nEmail: ${form.email || ''}\nTéléphone: ${form.phone || ''}\n\nMessage:\n${form.message || ''}`);
    window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
  };

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
          {/* Contact info cards */}
          <div className="space-y-4">
            {/* Email Card */}
            <a
              href={`mailto:${TARGET_EMAIL}?subject=Contact%20ReserverDark`}
              className="card p-5 flex items-center gap-4 transition-all hover:border-blue-500 hover:shadow-md group block"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email direct</p>
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{TARGET_EMAIL}</p>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Phone Card */}
            <a
              href={`tel:${TARGET_PHONE_INTL}`}
              className="card p-5 flex items-center gap-4 transition-all hover:border-blue-500 hover:shadow-md group block"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Téléphone / Appel</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>+212 6 14 35 10 30</p>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/212614351030?text=${encodeURIComponent('Bonjour Houssam, je vous contacte depuis ReserverDark.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex items-center gap-4 transition-all hover:border-green-500 hover:shadow-md group block border-green-500/30"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-600/10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold">WhatsApp direct</p>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>0614351030</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-green-600 text-white shadow-xs">
                Chat
              </span>
            </a>

            {/* Address Card */}
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('common.address')}</p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Casablanca, Maroc</p>
              </div>
            </div>

            {/* Map embed */}
            <div className="rounded-2xl overflow-hidden h-44 border shadow-sm" style={{ borderColor: 'var(--border)' }}>
              <iframe
                title="Casablanca Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106804.98!2d-7.65!3d33.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda7cd4778aa113b%3A0xb06c1d84f310fd3!2sCasablanca!5e0!3m2!1sfr!2sma!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 card p-6 sm:p-8 shadow-sm">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Message enregistré avec succès !</h2>
                <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
                  Votre demande a bien été enregistrée. Pour une réponse encore plus rapide ou pour nous envoyer directement un message :
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={createWhatsAppUrl(form)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <MessageCircle className="w-4 h-4" /> Discuter sur WhatsApp ({TARGET_PHONE})
                  </a>
                  <a
                    href={createGmailWebUrl(form)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <Mail className="w-4 h-4" /> Envoyer depuis Gmail
                  </a>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="text-xs font-semibold underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {t('auth.name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input text-sm py-2.5"
                      placeholder="Votre nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      {t('auth.email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="input text-sm py-2.5"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Numéro de téléphone <span className="text-xs text-gray-400 font-normal">(optionnel)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="input text-sm py-2.5"
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                      Sujet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="input text-sm py-2.5"
                      placeholder="De quoi s'agit-il ?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="input text-sm py-2.5 resize-none"
                    placeholder="Écrivez votre message ici..."
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:flex-1 py-3 rounded-xl font-bold text-sm shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? t('common.loading') : 'Envoyer le message'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp ({TARGET_PHONE})
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectGmail}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4" />
                    Gmail
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
