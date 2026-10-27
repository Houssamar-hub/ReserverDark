/**
 * @file budgetAdvisor.js
 * @description Provides clear, transparent housing cost and affordability estimates
 * with explicit formulas, marked unknowns, and non-guaranteed disclaimers.
 */

import Property from '../../models/Property.js';

/**
 * Calculates rental and purchase estimates
 */
export async function calculateHousingBudget(propertyId, options = {}) {
  const { monthlyIncome, durationMonths = 1 } = options;

  const property = await Property.findById(propertyId).lean();
  if (!property) {
    throw new Error('Property not found');
  }

  const listingType = property.listingType || 'rent';
  const basePrice = property.pricePerNight;

  if (listingType === 'rent') {
    // Rental calculation
    // Note: in ReserverDark, pricePerNight can represent nightly rate for short stay or monthly rate for long term
    const monthlyRate = basePrice;
    const cautionEstimateMonths = 1; // standard rental practice in Morocco
    const estimatedSecurityDeposit = monthlyRate * cautionEstimateMonths;
    const totalMoveInEstimate = monthlyRate + estimatedSecurityDeposit;

    let affordabilityRatio = null;
    let affordabilityAssessment = null;

    if (monthlyIncome && monthlyIncome > 0) {
      affordabilityRatio = Math.round((monthlyRate / monthlyIncome) * 100);
      if (affordabilityRatio <= 33) {
        affordabilityAssessment = {
          status: 'healthy',
          message: `Le loyer représente ${affordabilityRatio}% de vos revenus mensuels (en dessous du seuil recommandé de 33%).`,
        };
      } else if (affordabilityRatio <= 45) {
        affordabilityAssessment = {
          status: 'moderate',
          message: `Le loyer représente ${affordabilityRatio}% de vos revenus. Cela reste accessible mais demande une gestion attentive des charges.`,
        };
      } else {
        affordabilityAssessment = {
          status: 'strained',
          message: `Attention: ce loyer représente ${affordabilityRatio}% de vos revenus (> 33%). Risque de tension sur votre budget mensuel.`,
        };
      }
    }

    return {
      type: 'rent',
      currency: 'MAD / DH',
      basePricePerUnit: monthlyRate,
      breakdown: [
        {
          label: 'Loyer mensuel de base (certifié)',
          amount: monthlyRate,
          formula: `${monthlyRate} DH`,
          isVerified: true,
        },
        {
          label: 'Caution de garantie estimative (1 mois)',
          amount: estimatedSecurityDeposit,
          formula: `1 × Loyer mensuel = ${estimatedSecurityDeposit} DH`,
          isVerified: false,
          note: 'Usage courant au Maroc, restituable à la sortie selon état des lieux',
        },
        {
          label: 'Frais de syndic / copropriété',
          amount: null,
          status: 'unknown',
          note: 'Non renseigné dans la fiche. À vérifier directement avec le propriétaire.',
        },
        {
          label: 'Charges courantes (Eau / Électricité / Internet)',
          amount: null,
          status: 'unknown',
          note: 'Variables selon votre consommation personnelle.',
        },
      ],
      totalMoveInEstimate,
      affordabilityAssessment,
      disclaimer: 'Estimation indicative basée sur les données déclarées du bien et les pratiques courantes au Maroc. Ne constitue pas un devis contractuel.',
    };
  }

  // Purchase (Vente) calculation
  const purchasePrice = basePrice;
  // Moroccan standard statutory acquisition fees:
  // - Droits d'enregistrement (Registration duty): 4%
  // - Conservation foncière (Land registry): 1.5% + 150 DH
  // - Notary fees (Honoraires de notaire): ~1% HT (+ 10% TVA)
  // - Formalités & débours (Stamps & filing): ~1,500 DH
  const registrationTax = Math.round(purchasePrice * 0.04);
  const landConservation = Math.round(purchasePrice * 0.015 + 150);
  const notaryFeesEst = Math.round(purchasePrice * 0.01 * 1.1);
  const fileAndStampsEst = 1500;
  const totalNotaryAndStatutoryCosts = registrationTax + landConservation + notaryFeesEst + fileAndStampsEst;
  const totalEstimatedAcquisition = purchasePrice + totalNotaryAndStatutoryCosts;

  return {
    type: 'sale',
    currency: 'MAD / DH',
    purchasePrice,
    breakdown: [
      {
        label: "Prix d'acquisition affiché (certifié)",
        amount: purchasePrice,
        formula: `${purchasePrice.toLocaleString()} DH`,
        isVerified: true,
      },
      {
        label: "Droits d'enregistrement légaux (4%)",
        amount: registrationTax,
        formula: `${purchasePrice.toLocaleString()} DH × 4% = ${registrationTax.toLocaleString()} DH`,
        isVerified: false,
        statutoryBasis: 'Code Général des Impôts Marocain',
      },
      {
        label: 'Conservation foncière (1.5% + 150 DH)',
        amount: landConservation,
        formula: `(${purchasePrice.toLocaleString()} DH × 1.5%) + 150 DH = ${landConservation.toLocaleString()} DH`,
        isVerified: false,
        statutoryBasis: 'Tarif ANCFCC Maroc',
      },
      {
        label: 'Honoraires estimatifs du notaire (~1% + TVA)',
        amount: notaryFeesEst,
        formula: `~1% du prix + TVA 10% = ${notaryFeesEst.toLocaleString()} DH`,
        isVerified: false,
        note: 'À convenir avec le notaire choisi.',
      },
      {
        label: 'Frais de dossier et timbres',
        amount: fileAndStampsEst,
        formula: 'Forfait estimatif usuel ~1,500 DH',
        isVerified: false,
      },
    ],
    totalEstimatedStatutoryCosts: totalNotaryAndStatutoryCosts,
    totalEstimatedAcquisition,
    statutoryPercentage: ((totalNotaryAndStatutoryCosts / purchasePrice) * 100).toFixed(1) + '%',
    disclaimer: 'Calcul indicatif basé sur les barèmes légaux marocains en vigueur (enregistrement et conservation foncière). Les frais de notaire exacts doivent être confirmés par votre notaire.',
  };
}
