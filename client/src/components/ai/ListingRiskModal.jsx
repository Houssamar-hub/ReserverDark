import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import aiService from '../../services/aiService';

export default function ListingRiskModal({ isOpen, onClose, property }) {
  const [reportedPayment, setReportedPayment] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && property?._id) {
      fetchRiskAnalysis();
    }
  }, [isOpen, property?._id, reportedPayment]);

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.analyzeListing({
        propertyId: property._id,
        userReportedPaymentRequest: reportedPayment,
        language: 'fr',
      });
      setRiskData(res.analysis);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Erreur lors de l'analyse de sécurité");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Assistant de Vigilance & Sécurité de l'Annonce
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Détection prudente d'anomalies, vérification des données et conseils de sécurité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target property overview */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {property.title}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">{property.city}, Maroc — {property.pricePerNight} DH</p>
            </div>
            {riskData && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                style={{ backgroundColor: `${riskData.badgeColor}20`, color: riskData.badgeColor, border: `1px solid ${riskData.badgeColor}40` }}
              >
                Risque {riskData.riskLevel}
              </span>
            )}
          </div>

          {/* Interactive Checkbox for advance payment report */}
          <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reportedPayment}
                onChange={(e) => setReportedPayment(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div className="text-xs">
                <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  Le propriétaire vous a-t-il réclamé un paiement préalable avant toute visite ?
                </span>
                <span className="text-gray-500">
                  (Cocher cette case déclenche immédiatement une alerte rouge de vigilance sur le protocole de transaction).
                </span>
              </div>
            </label>
          </div>

          {loading && (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Analyse de conformité en cours...</p>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
              {error}
            </div>
          )}

          {riskData && !loading && (
            <div className="space-y-4">
              {/* Summary explanation */}
              <div className="p-3.5 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {riskData.explanation}
                </p>
              </div>

              {/* Indicators list */}
              {riskData.indicators.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Indicateurs relevés ({riskData.indicators.length})
                  </h4>
                  {riskData.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border space-y-1.5"
                      style={{
                        borderColor: ind.level === 'high' ? 'rgba(220, 38, 38, 0.3)' : 'var(--border)',
                        backgroundColor: ind.level === 'high' ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${ind.level === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                          {ind.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 pl-6">
                        <strong className="text-gray-700 dark:text-gray-300">Constat : </strong>{ind.evidence}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 pl-6">
                        <strong>Conseil : </strong>{ind.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-medium">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span>Tous les indicateurs clés sont conformes (prix cohérent avec le marché local, photos suffisantes, description claire).</span>
                </div>
              )}

              {/* Recommended Verification Steps */}
              <div className="p-4 rounded-xl border space-y-2.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <h4 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Info className="w-4 h-4 text-indigo-500" />
                  Règles d'or pour louer ou acheter en sécurité au Maroc
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-500">
                  {riskData.recommendedVerificationSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cautious disclaimer */}
              <p className="text-[11px] text-gray-400 italic text-center">
                {riskData.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
