import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Users, Sparkles, Check, Calculator, ShieldAlert, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';
import { formatImageUrl, handleImageError } from '../../utils/formatImage';

export default function AiPropertyCard({
  property,
  explanation,
  isSelectedForCompare,
  onToggleCompare,
  onOpenBudget,
  onOpenRisk,
}) {
  const isSale = property.listingType === 'sale';
  const statusLabel = isSale ? 'À vendre' : 'À louer';
  const statusColor = isSale
    ? { bg: '#dcfce7', text: '#16a34a' }
    : { bg: '#dbeafe', text: '#2563eb' };

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col justify-between group shadow-sm hover:shadow-md ${
        isSelectedForCompare ? 'ring-2 ring-indigo-500' : ''
      }`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: isSelectedForCompare ? 'var(--accent)' : 'var(--border)' }}
    >
      {/* Top Image + Badges */}
      <div>
        <div className="relative overflow-hidden h-48">
          <img
            src={formatImageUrl(property.images?.[0])}
            onError={handleImageError}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Type + listing type */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold shadow-sm"
              style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
            >
              {statusLabel}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-gray-800 shadow-sm">
              {property.type}
            </span>
          </div>

          {/* Compare selection checkbox */}
          <button
            type="button"
            onClick={() => onToggleCompare && onToggleCompare(property._id)}
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all ${
              isSelectedForCompare
                ? 'bg-indigo-600 text-white font-bold ring-2 ring-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              isSelectedForCompare ? 'border-white bg-indigo-600 text-white' : 'border-gray-400'
            }`}>
              {isSelectedForCompare && <Check className="w-3 h-3 stroke-[3]" />}
            </span>
            {isSelectedForCompare ? 'Sélectionné' : 'Comparer'}
          </button>

          {/* Alternative indicator if applicable */}
          {property.isAlternative && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
              Alternative suggérée
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Price & Title */}
          <div>
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {formatPrice(property.pricePerNight)}
              <span className="text-xs font-normal text-gray-500 ml-1">
                {isSale ? 'DH' : 'DH / nuit'}
              </span>
            </div>
            <h3 className="font-bold text-sm leading-snug line-clamp-1 mt-1" style={{ color: 'var(--text-primary)' }}>
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">{property.city}, Maroc</span>
            </div>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-xs pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-indigo-500" />
              {property.bedrooms} ch.
            </span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-3.5 h-3.5 text-indigo-500" />
              {property.bathrooms} sdb
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {property.maxGuests} pers.
            </span>
          </div>

          {/* Grounded AI Match Explanation */}
          {explanation && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 text-[11px] uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Pourquoi ce logement ?
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                {explanation.explanation}
              </p>
              {explanation.relaxedReasons?.length > 0 && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  {explanation.relaxedReasons.join(' • ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenBudget && onOpenBudget(property)}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-500" />
            Budget
          </button>
          <button
            type="button"
            onClick={() => onOpenRisk && onOpenRisk(property)}
            className="py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Sécurité
          </button>
        </div>

        <Link
          to={`/properties/${property._id}`}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          Voir tous les détails <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
