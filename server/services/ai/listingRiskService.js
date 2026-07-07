/**
 * @file listingRiskService.js
 * @description Analyzes listings for potential risk indicators using deterministic rules
 * and cautious AI explanation. Never accuses owners of fraud without proof,
 * and always provides practical verification advice.
 */

import Property from '../../models/Property.js';
import gemmaProvider from './gemmaProvider.js';

export async function analyzeListingRisk(propertyId, userReportedPaymentRequest = false, language = 'fr') {
  const property = await Property.findById(propertyId).lean();
  if (!property) {
    throw new Error('Property not found');
  }

  const indicators = [];
  let riskScore = 0; // 0 = low, 1-2 = medium, 3+ = high

  // 1. Incomplete description or missing essentials
  if (!property.description || property.description.trim().length < 25) {
    riskScore += 1;
    indicators.push({
      type: 'description_brevity',
      level: 'medium',
      title: 'Description très succincte',
      evidence: `La description contient seulement ${property.description ? property.description.length : 0} caractères.`,
      recommendation: 'Demander au propriétaire des précisions écrites sur l’état et les équipements exacts.',
    });
  }

  // 2. Images check
  if (!property.images || property.images.length < 2) {
    riskScore += 1;
    indicators.push({
      type: 'sparse_images',
      level: 'medium',
      title: 'Nombre de photos réduit',
      evidence: `L’annonce comporte seulement ${property.images ? property.images.length : 0} photo(s).`,
      recommendation: 'Exiger une visite vidéo en direct ou des photos complémentaires avant tout engagement.',
    });
  }

  // 3. Contradictory property details
  const titleLower = property.title.toLowerCase();
  if (titleLower.includes('villa') && property.bedrooms <= 1 && property.type !== 'Villa') {
    riskScore += 1;
    indicators.push({
      type: 'contradictory_type',
      level: 'medium',
      title: 'Incohérence entre titre et type de bien',
      evidence: `Le titre mentionne une villa mais la fiche indique 1 seule chambre / type ${property.type}.`,
      recommendation: 'Vérifier la nature réelle du bien auprès du loueur.',
    });
  }

  // 4. Price anomaly: check comparable listings in same city & type
  try {
    const comparables = await Property.find({
      city: property.city,
      type: property.type,
      status: 'approved',
      _id: { $ne: property._id },
    }).select('pricePerNight').lean();

    if (comparables.length >= 3) {
      const avgPrice = comparables.reduce((acc, c) => acc + c.pricePerNight, 0) / comparables.length;
      if (property.pricePerNight < avgPrice * 0.45) {
        riskScore += 2;
        indicators.push({
          type: 'price_outlier_low',
          level: 'high',
          title: 'Tarif sensiblement inférieur aux biens comparables',
          evidence: `Prix de ${property.pricePerNight} DH, soit plus de 55% sous la moyenne locale constatée (${Math.round(avgPrice)} DH pour un ${property.type} à ${property.city}).`,
          recommendation: 'Méfiance face aux prix anormalement attractifs. Ne versez aucun acompte avant visite physique.',
        });
      }
    }
  } catch (err) {
    console.warn('Comparable price check error:', err.message);
  }

  // 5. User-reported advance payment request before visit
  if (userReportedPaymentRequest) {
    riskScore += 3;
    indicators.push({
      type: 'advance_payment_request',
      level: 'high',
      title: 'Demande de paiement ou mandat avant visite physique',
      evidence: 'Un versement préalable (Western Union, virement ou mandat) a été sollicité avant de visiter les lieux.',
      recommendation: 'ALERTE MAJEURE: Ne jamais transférer d’argent à l’avance à un tiers inconnu sans visite et contrat écrit.',
    });
  }

  // Determine overall risk level
  let riskLevel = 'Faible';
  let badgeColor = '#16a34a'; // green
  if (riskScore >= 3) {
    riskLevel = 'Élevé';
    badgeColor = '#dc2626'; // red
  } else if (riskScore >= 1) {
    riskLevel = 'Modéré';
    badgeColor = '#f59e0b'; // amber
  }

  // Generate explanation
  let explanation = '';
  if (indicators.length === 0) {
    explanation = 'Aucune anomalie flagrante n’a été détectée dans les champs de cette annonce. Le profil présente des informations complètes et cohérentes.';
  } else {
    explanation = `L’analyse a identifié ${indicators.length} point(s) d’attention nécessitant votre vigilance avant tout engagement.`;
  }

  return {
    propertyId: property._id,
    title: property.title,
    city: property.city,
    price: property.pricePerNight,
    riskLevel,
    riskScore,
    badgeColor,
    indicators,
    explanation,
    recommendedVerificationSteps: [
      'Toujours effectuer une visite physique ou visioconférence en direct avant tout paiement.',
      'Exiger une pièce d’identité du bailleur et vérifier la conformité du contrat de bail.',
      'Privilégier les paiements avec reçu ou preuve bancaire identifiable.',
      'Ne jamais céder à l’urgence prétextée par un interlocuteur réclamant des arrhes par transfert instantané.',
    ],
    disclaimer: 'Cette analyse automatisée signale des indicateurs de prudence et ne constitue ni une accusation de fraude ni une garantie juridique de conformité.',
  };
}
