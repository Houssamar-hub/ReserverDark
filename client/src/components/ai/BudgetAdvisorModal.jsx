import React, { useState, useEffect } from 'react';
import { X, Calculator, AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import aiService from '../../services/aiService';

export default function BudgetAdvisorModal({ isOpen, onClose, property }) {
  const [income, setIncome] = useState('');
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && property?._id) {
      fetchBudget();
    }
  }, [isOpen, property?._id]);

  const fetchBudget = async (overrideIncome) => {
    setLoading(true);
    setError(null);
    try {
      const inc = overrideIncome !== undefined ? overrideIncome : (income ? parseFloat(income) : undefined);
      const res = await aiService.getBudget({
        propertyId: property._id,
        monthlyIncome: inc,
      });
      setBudgetData(res.budget);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du calcul du budget');
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    fetchBudget(parseFloat(income) || undefined);
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
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Conseiller Budget & Frais Transparents
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Calcul clair des coûts prévisibles avec formules et vérification des inconnues
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
          {/* Target property card overview */}
          <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 mr-2">
                {property.listingType === 'sale' ? 'Vente' : 'Location'}
              </span>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {property.title}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">{property.city}, Maroc</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(property.pricePerNight)}
              </div>
              <span className="text-[10px] text-gray-400">Prix catalogue</span>
            </div>
          </div>

          {/* Income input for rental affordability */}
          {property.listingType !== 'sale' && (
            <form onSubmit={handleIncomeSubmit} className="p-4 rounded-xl border space-y-3" style={{ borderColor: 'var(--border)' }}>
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                Tester votre capacité financière (revenu net mensuel en DH) :
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 8000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                >
                  Calculer
                </button>
              </div>

              {budgetData?.affordabilityAssessment && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                    budgetData.affordabilityAssessment.status === 'healthy'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                      : budgetData.affordabilityAssessment.status === 'moderate'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{budgetData.affordabilityAssessment.message}</span>
                </div>
              )}
            </form>
          )}

          {loading && (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {error && (
            <div className="p-3 text-sm rounded-xl bg-red-500/10 border border-red-500/20 text-red-600">
              {error}
            </div>
          )}

          {budgetData && !loading && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Détail transparent des postes de dépenses
              </h4>

              <div className="space-y-2">
                {budgetData.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border flex items-center justify-between text-xs"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.isVerified ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Vérifié en base" />
                        ) : item.status === 'unknown' ? (
                          <HelpCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" title="Estimation légale / usuelle" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      {item.formula && (
                        <p className="text-[11px] text-gray-500 font-mono">{item.formula}</p>
                      )}
                      {item.note && (
                        <p className="text-[11px] text-gray-400 italic">{item.note}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {item.amount !== null ? (
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.amount.toLocaleString()} DH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          Non renseigné
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary total */}
              <div className="p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                    {budgetData.type === 'sale' ? 'Coût total estimatif d’acquisition' : 'Budget initial d’emménagement estimé'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {budgetData.type === 'sale' ? 'Prix d’achat + taxes notariales (~7-8%)' : 'Premier loyer + 1 mois de caution usuelle'}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {(budgetData.totalEstimatedAcquisition || budgetData.totalMoveInEstimate)?.toLocaleString()} DH
                </div>
              </div>

              {/* Strict disclaimer */}
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900 border text-[11px] text-gray-500 flex items-start gap-2" style={{ borderColor: 'var(--border)' }}>
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>{budgetData.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
