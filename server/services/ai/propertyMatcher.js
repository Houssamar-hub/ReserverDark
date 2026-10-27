/**
 * @file propertyMatcher.js
 * @description Queries real database records, filters strictly, ranks deterministically,
 * and handles relaxed alternatives when no exact match exists.
 */

import Property from '../../models/Property.js';

/**
 * Normalizes city strings for resilient comparison
 */
function normalizeCity(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[-_]/g, ' ').trim();
}

/**
 * Calculate deterministic match score
 */
function calculateScore(property, criteria) {
  let score = 0;
  const matchDetails = {
    matchedCriteria: [],
    partialCriteria: [],
    unmatchedCriteria: [],
  };

  // 1. Transaction Type Match
  if (criteria.transactionType) {
    const propTx = property.listingType || 'rent';
    if (propTx === criteria.transactionType) {
      score += 25;
      matchDetails.matchedCriteria.push(`Type d'opération: ${criteria.transactionType === 'sale' ? 'Vente' : 'Location'}`);
    } else {
      matchDetails.unmatchedCriteria.push(`Opération différente (${propTx === 'sale' ? 'Vente' : 'Location'})`);
      return { score: 0, eligible: false, matchDetails }; // Strict exclusion
    }
  }

  // 2. City Match
  if (criteria.city) {
    const normPropCity = normalizeCity(property.city);
    const normReqCity = normalizeCity(criteria.city);
    if (normPropCity.includes(normReqCity) || normReqCity.includes(normPropCity)) {
      score += 25;
      matchDetails.matchedCriteria.push(`Ville: ${property.city}`);
    } else {
      matchDetails.unmatchedCriteria.push(`Ville demandée: ${criteria.city} (propriété située à ${property.city})`);
      return { score: 0, eligible: false, matchDetails }; // Strict exclusion
    }
  }

  // 3. Strict Budget Compatibility
  if (criteria.maxPrice) {
    if (property.pricePerNight <= criteria.maxPrice) {
      score += 25;
      const saving = criteria.maxPrice - property.pricePerNight;
      matchDetails.matchedCriteria.push(
        `Prix dans le budget: ${property.pricePerNight} DH (inférieur au max de ${criteria.maxPrice} DH)`
      );
      if (saving > 0) score += Math.min(5, Math.floor((saving / criteria.maxPrice) * 5));
    } else {
      // Over budget: NEVER eligible as exact match
      matchDetails.unmatchedCriteria.push(
        `Prix supérieur au budget: ${property.pricePerNight} DH > ${criteria.maxPrice} DH`
      );
      return { score: 0, eligible: false, matchDetails };
    }
  }

  // 4. Min Price
  if (criteria.minPrice && property.pricePerNight < criteria.minPrice) {
    matchDetails.unmatchedCriteria.push(`Prix inférieur au minimum: ${property.pricePerNight} DH`);
    return { score: 0, eligible: false, matchDetails };
  }

  // 5. Property Type Match
  if (criteria.propertyType) {
    if (property.type.toLowerCase() === criteria.propertyType.toLowerCase()) {
      score += 15;
      matchDetails.matchedCriteria.push(`Catégorie: ${property.type}`);
    } else {
      matchDetails.partialCriteria.push(`Type proposé: ${property.type} au lieu de ${criteria.propertyType}`);
    }
  }

  // 6. Bedroom Count
  if (criteria.minBedrooms !== null && criteria.minBedrooms !== undefined) {
    if (property.bedrooms >= criteria.minBedrooms) {
      score += 10;
      matchDetails.matchedCriteria.push(`Chambres: ${property.bedrooms} (minimum requis: ${criteria.minBedrooms})`);
    } else {
      matchDetails.unmatchedCriteria.push(`Nombre de chambres insuffisant: ${property.bedrooms} < ${criteria.minBedrooms}`);
      return { score: 0, eligible: false, matchDetails };
    }
  }

  // 7. Bathrooms
  if (criteria.minBathrooms !== null && criteria.minBathrooms !== undefined) {
    if (property.bathrooms >= criteria.minBathrooms) {
      score += 5;
      matchDetails.matchedCriteria.push(`Salles de bain: ${property.bathrooms}`);
    }
  }

  // 8. Amenities Match
  if (criteria.amenities && criteria.amenities.length > 0) {
    const propAmenities = (property.amenities || []).map(a => a.toLowerCase());
    let matchedAmenitiesCount = 0;

    criteria.amenities.forEach(amenity => {
      const found = propAmenities.some(pa => pa.includes(amenity.toLowerCase()) || amenity.toLowerCase().includes(pa));
      if (found) {
        matchedAmenitiesCount++;
        score += 5;
        matchDetails.matchedCriteria.push(`Équipement: ${amenity}`);
      } else {
        matchDetails.partialCriteria.push(`Équipement non mentionné: ${amenity}`);
      }
    });
  }

  return { score, eligible: true, matchDetails };
}

/**
 * Searches the database and ranks matching properties
 */
export async function searchAndRankProperties(criteria, options = {}) {
  const { limit = 6, allowAlternatives = true } = options;

  // Base database filter: only approved listings
  const query = { status: 'approved' };

  if (criteria.city) {
    query.city = { $regex: new RegExp(criteria.city.trim(), 'i') };
  }

  if (criteria.transactionType) {
    query.listingType = criteria.transactionType;
  }

  if (criteria.propertyType) {
    query.type = criteria.propertyType;
  }

  if (criteria.minBedrooms) {
    query.bedrooms = { $gte: criteria.minBedrooms };
  }

  if (criteria.maxPrice) {
    query.pricePerNight = { $lte: criteria.maxPrice };
  }

  if (criteria.minPrice) {
    query.pricePerNight = { ...query.pricePerNight, $gte: criteria.minPrice };
  }

  // Fetch approved candidates from MongoDB
  let candidates = [];
  try {
    candidates = await Property.find(query)
      .populate('owner', 'name email phone avatar')
      .lean();
  } catch (err) {
    console.error('Database query error in propertyMatcher:', err.message);
    throw err;
  }

  // Deterministic scoring of results
  const exactMatches = [];
  for (const property of candidates) {
    const { score, eligible, matchDetails } = calculateScore(property, criteria);
    if (eligible) {
      exactMatches.push({
        property,
        score,
        isAlternative: false,
        matchDetails,
      });
    }
  }

  // Sort exact matches by score descending
  exactMatches.sort((a, b) => b.score - a.score);

  // If exact matches found, return them
  if (exactMatches.length > 0) {
    return {
      status: 'exact_matches_found',
      count: exactMatches.length,
      blockedCriteria: [],
      properties: exactMatches.slice(0, limit),
      hasAlternatives: false,
    };
  }

  // If NO exact matches found and alternatives allowed:
  // Diagnose blocked criteria and search relaxed candidates
  const blockedCriteria = [];
  if (criteria.maxPrice) blockedCriteria.push('Budget maximum');
  if (criteria.minBedrooms) blockedCriteria.push(`${criteria.minBedrooms} chambres minimum`);
  if (criteria.amenities?.length) blockedCriteria.push(`Équipements (${criteria.amenities.join(', ')})`);

  let alternatives = [];
  if (allowAlternatives) {
    // Relaxed search: relax budget up to +25% or relax type/amenity
    const relaxedQuery = { status: 'approved' };
    if (criteria.city) {
      relaxedQuery.city = { $regex: new RegExp(criteria.city.trim(), 'i') };
    }
    if (criteria.transactionType) {
      relaxedQuery.listingType = criteria.transactionType;
    }
    if (criteria.maxPrice) {
      // Allow +30% budget leeway for alternatives
      relaxedQuery.pricePerNight = { $lte: Math.round(criteria.maxPrice * 1.3) };
    }

    const relaxedCandidates = await Property.find(relaxedQuery)
      .populate('owner', 'name email phone avatar')
      .limit(limit)
      .lean();

    alternatives = relaxedCandidates.map(property => {
      const relaxedReasons = [];
      if (criteria.maxPrice && property.pricePerNight > criteria.maxPrice) {
        relaxedReasons.push(`Budget supérieur (${property.pricePerNight} DH vs ${criteria.maxPrice} DH)`);
      }
      if (criteria.minBedrooms && property.bedrooms < criteria.minBedrooms) {
        relaxedReasons.push(`${property.bedrooms} chambre(s) au lieu de ${criteria.minBedrooms}`);
      }

      return {
        property,
        score: 50,
        isAlternative: true,
        relaxedReasons,
        matchDetails: {
          matchedCriteria: [`Ville: ${property.city}`],
          partialCriteria: relaxedReasons,
          unmatchedCriteria: [],
        },
      };
    });
  }

  return {
    status: 'no_exact_matches',
    count: 0,
    blockedCriteria,
    properties: alternatives.slice(0, limit),
    hasAlternatives: alternatives.length > 0,
  };
}
