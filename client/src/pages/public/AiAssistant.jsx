import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  RotateCcw,
  Scale,
  MapPin,
  Sliders,
  DollarSign,
  Bed,
  Layers,
  AlertCircle,
  HelpCircle,
  Shield,
  Bot,
  User,
  CheckCircle,
} from 'lucide-react';
import aiService from '../../services/aiService';
import AiPropertyCard from '../../components/ai/AiPropertyCard';
import PropertyComparatorModal from '../../components/ai/PropertyComparatorModal';
import BudgetAdvisorModal from '../../components/ai/BudgetAdvisorModal';
import ListingRiskModal from '../../components/ai/ListingRiskModal';

const EXAMPLE_PROMPTS = [
  {
    lang: '🇲🇦 Darija',
    text: 'Bghit appartement lkra f Beni Mellal, max 2500 dh, fih juj dyal lbitat.',
  },
  {
    lang: '🇲🇦 Darija Refinement',
    text: 'Wakha, khasni balcon.',
  },
  {
    lang: '🇲🇦 Darija Budget',
    text: 'Khlli budget 3000.',
  },
  {
    lang: '🇲🇦 العربية',
    text: 'بغيت ستوديو للكراء قريب من الجامعة وبثمن مناسب.',
  },
  {
    lang: '🇫🇷 Français',
    text: 'Je cherche une maison à vendre à Casablanca avec trois chambres.',
  },
  {
    lang: '🇬🇧 English',
    text: 'I need an apartment for rent with two bedrooms and a balcony.',
  },
];

export default function AiAssistant() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [criteria, setCriteria] = useState({});
  const [properties, setProperties] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [providerStatus, setProviderStatus] = useState(null);

  // Modals state
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [budgetModalProperty, setBudgetModalProperty] = useState(null);
  const [riskModalProperty, setRiskModalProperty] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize on mount
  useEffect(() => {
    // Generate fresh session or restore
    const sid = 'sess_' + Math.random().toString(36).substring(2, 12);
    setSessionId(sid);

    // Initial greeting message
    const initialGreeting = i18n.language === 'ar'
      ? 'مرحباً بك في ReserverDark AI! أنا مساعدك الذكي المتخصص في العقارات بالمغرب. يمكنك سؤالي بالدارجة، العربية، الفرنسية أو الإنجليزية، وسأبحث لك عن أفضل العقارات الحقيقية المطابقة لاحتياجاتك.'
      : i18n.language === 'fr'
      ? 'Bonjour ! Je suis l’assistant intelligent de ReserverDark. Posez-moi votre recherche en Darija, Français, Arabe ou Anglais : je recherche en direct dans notre base de données certifiée et je vous explique chaque correspondance.'
      : 'Hello! I am your ReserverDark Smart Assistant. Search in Darija, French, Arabic, or English: I find matching real database properties and explain why they suit your needs.';

    setMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: initialGreeting,
      },
    ]);

    // Check backend provider status
    aiService.getStatus()
      .then(status => setProviderStatus(status))
      .catch(() => setProviderStatus({ isConfigured: false, model: 'Offline / Fallback' }));
  }, [i18n.language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    // Add user message to UI
    const userMsg = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: textToSend,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chat({
        message: textToSend,
        sessionId,
      });

      // Update state
      if (response.sessionId) setSessionId(response.sessionId);
      if (response.criteria) setCriteria(response.criteria);
      if (response.properties) setProperties(response.properties);
      if (response.explanations) setExplanations(response.explanations);

      const assistantMsg = {
        id: 'ast_' + Date.now(),
        role: 'assistant',
        content: response.reply,
        totalMatches: response.totalMatches,
        hasAlternatives: response.hasAlternatives,
        blockedCriteria: response.blockedCriteria,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        isError: true,
        content:
          err.response?.data?.message ||
          'Une erreur est survenue lors de la communication avec l’assistant. Veuillez réessayer.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (sessionId) {
      await aiService.reset(sessionId).catch(() => {});
    }
    const newSid = 'sess_' + Math.random().toString(36).substring(2, 12);
    setSessionId(newSid);
    setCriteria({});
    setProperties([]);
    setExplanations([]);
    setSelectedForCompare([]);
    setMessages([
      {
        id: 'msg_reset',
        role: 'assistant',
        content: 'La conversation a été réinitialisée. Comment puis-je vous aider dans votre nouvelle recherche ?',
      },
    ]);
  };

  const toggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(x => x !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('Vous pouvez comparer jusqu’à 3 logements simultanément.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  // Check active criteria count
  const activeCriteriaCount = Object.values(criteria).filter(
    val => val !== null && val !== undefined && (!Array.isArray(val) || val.length > 0)
  ).length;

  return (
    <div className="min-h-screen transition-colors duration-200 pt-20 pb-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </span>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ReserverDark AI <span className="text-indigo-600 dark:text-indigo-400">— Votre Assistant Immobilier</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Recherche intelligente en Darija marocain, Arabe, Français et Anglais connectée à la base de données réelle.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="px-3 py-1.5 rounded-full border text-xs flex items-center gap-2"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              <span className={`w-2 h-2 rounded-full ${providerStatus?.isConfigured ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
              <span className="font-medium text-[11px]">
                {providerStatus?.isConfigured ? `Gemma: ${providerStatus.model}` : 'Moteur Hybride Actif'}
              </span>
            </div>

            {/* Reset button */}
            <button
              onClick={handleReset}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              title="Réinitialiser la conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nouvelle recherche</span>
            </button>
          </div>
        </div>

        {/* Active Criteria Live Inspector Box */}
        {activeCriteriaCount > 0 && (
          <div className="p-4 rounded-2xl border space-y-2 animate-fadeIn"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Critères reconnus en mémoire ({activeCriteriaCount})
              </span>
              <span className="text-[11px] font-normal text-indigo-500">Maintien du contexte actif</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {criteria.transactionType && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {criteria.transactionType === 'sale' ? 'Vente' : 'Location'}
                </span>
              )}
              {criteria.city && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {criteria.city}
                </span>
              )}
              {criteria.maxPrice && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Max {criteria.maxPrice} DH
                </span>
              )}
              {criteria.propertyType && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                  {criteria.propertyType}
                </span>
              )}
              {criteria.minBedrooms && (
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  {criteria.minBedrooms} ch. min
                </span>
              )}
              {criteria.amenities?.map((amenity, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Stream */}
        <div className="rounded-3xl border overflow-hidden flex flex-col shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>

          <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-red-500/10 text-red-600 border border-red-500/20 rounded-tl-none'
                      : 'border rounded-tl-none'
                  }`}
                  style={msg.role === 'assistant' && !msg.isError ? {
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  } : undefined}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 text-sm items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none border flex items-center gap-2"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-gray-500 ml-2">Recherche et raisonnement en direct...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips Bar */}
          <div className="px-6 py-3 border-t overflow-x-auto flex items-center gap-2"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
              Suggestions :
            </span>
            {EXAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                className="px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap hover:border-indigo-500 hover:text-indigo-600 transition-colors flex-shrink-0"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}
              >
                <span className="font-bold text-gray-500 mr-1">{p.lang}:</span>
                {p.text}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t flex gap-2"
            style={{ borderColor: 'var(--border)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.promptPlaceholder') || 'Tapez votre demande en Darija, Français, Arabe ou Anglais...'}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>

        {/* Real Matched Properties Grid */}
        {properties.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>Logements certifiés de la base ({properties.length})</span>
                </h2>
                <p className="text-xs text-gray-500">
                  Résultats vérifiés issus de la base de données réelle ReserverDark
                </p>
              </div>

              {/* Compare floating badge/button */}
              {selectedForCompare.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setCompareModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start animate-pulse"
                >
                  <Scale className="w-4 h-4" />
                  Comparer les {selectedForCompare.length} logements sélectionnés
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const exp = explanations.find(e => e.propertyId === property._id);
                return (
                  <AiPropertyCard
                    key={property._id}
                    property={property}
                    explanation={exp}
                    isSelectedForCompare={selectedForCompare.includes(property._id)}
                    onToggleCompare={toggleCompare}
                    onOpenBudget={(p) => setBudgetModalProperty(p)}
                    onOpenRisk={(p) => setRiskModalProperty(p)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Comparator Modal */}
        <PropertyComparatorModal
          isOpen={compareModalOpen}
          onClose={() => setCompareModalOpen(false)}
          propertyIds={selectedForCompare}
        />

        {/* Budget Modal */}
        <BudgetAdvisorModal
          isOpen={Boolean(budgetModalProperty)}
          onClose={() => setBudgetModalProperty(null)}
          property={budgetModalProperty}
        />

        {/* Risk Modal */}
        <ListingRiskModal
          isOpen={Boolean(riskModalProperty)}
          onClose={() => setRiskModalProperty(null)}
          property={riskModalProperty}
        />

      </div>
    </div>
  );
}
