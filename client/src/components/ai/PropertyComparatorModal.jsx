import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ArrowRight, Scale, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { formatImageUrl } from '../../utils/formatImage';
import aiService from '../../services/aiService';

export default function PropertyComparatorModal({ isOpen, onClose, propertyIds = [] }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && propertyIds.length >= 2) {
      fetchComparison();
    }
  }, [isOpen, propertyIds]);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.compare({ propertyIds, language: 'fr' });
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la comparaison');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-all"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Comparateur Intelligent de Logements
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Comparaison côte-à-côte basée sur les données certifiées de la plateforme
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Analyse comparative en cours...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {data && !loading && (
            <>
              {/* AI Trade-off Summary */}
              {data.summary && (
                <div
                  className="p-4 rounded-xl border space-y-2 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4" />
                    Synthèse comparative et arbitrages
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {data.summary}
                  </p>
                </div>
              )}

              {/* Grid of properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.matrix.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border overflow-hidden flex flex-col"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={formatImageUrl(p.images?.[0])}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800 shadow">
                        {p.type}
                      </span>
                      <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow">
                        {p.listingType === 'sale' ? 'Vente' : 'Location'}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                          {formatPrice(p.price)}
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            {p.listingType === 'sale' ? 'Total' : '/ nuit'}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                          {p.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{p.city}, Maroc</p>
                      </div>

                      {/* Criteria table */}
                      <div className="text-xs space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Chambres :</span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {p.bedrooms}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Salles de bain :</span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {p.bathrooms}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Capacité max :</span>
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {p.maxGuests} pers.
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }}>Prix / chambre :</span>
                          <span className="font-semibold text-indigo-500">
                            {p.pricePerBedroom} DH
                          </span>
                        </div>

                        {/* Amenities preview */}
                        <div className="pt-2">
                          <span className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                            Équipements déclarés :
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {p.amenities.slice(0, 5).map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[11px] bg-gray-200/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              >
                                {a}
                              </span>
                            ))}
                            {p.amenities.length > 5 && (
                              <span className="text-[11px] text-gray-400 self-center">
                                +{p.amenities.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={`/properties/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 w-full py-2 rounded-xl text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        Consulter la fiche <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
