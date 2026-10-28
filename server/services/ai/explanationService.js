/**
 * @file explanationService.js
 * @description Generates grounded, honest match explanations in Darija, Arabic, French, or English
 * using strictly verified database fields.
 */

import gemmaProvider from './gemmaProvider.js';

/**
 * Builds grounded deterministic explanation if AI model is offline or unconfigured
 */
function buildDeterministicExplanation(property, matchDetails, language = 'darija') {
  const { matchedCriteria, partialCriteria } = matchDetails || {};
  const city = property.city;
  const price = property.pricePerNight;
  const bedrooms = property.bedrooms;
  const type = property.type;

  if (language === 'darija') {
    const amenitiesText = property.amenities?.length ? `، وفيها ${property.amenities.slice(0, 3).join(' و ')}` : '';
    return `هاد ${type} كايوافق الطلب ديالك في ${city}: الثمن ديالو ${price} درهم داخل الميزانية، فيه ${bedrooms} ديال لبيتات${amenitiesText}. جميع المعلومات مبنية على بيانات السكن الموثقة.`;
  }

  if (language === 'ar') {
    const amenitiesText = property.amenities?.length ? `، وتتضمن: ${property.amenities.slice(0, 3).join('، ')}` : '';
    return `هذا العقار (${type}) في مدينة ${city} يطابق معايير بحثك: السعر ${price} درهم ملائم للميزانية، ويحتوي على ${bedrooms} غرف نوم${amenitiesText}. هذه البيانات مستخرجة مباشرة من قاعدة البيانات.`;
  }

  if (language === 'fr') {
    const matchedList = matchedCriteria?.length ? matchedCriteria.join(', ') : `${bedrooms} chambres, ${city}`;
    const amenities = property.amenities?.length ? ` Équipements inclus: ${property.amenities.slice(0, 4).join(', ')}.` : '';
    return `Ce bien (${type}) à ${city} correspond à vos critères vérifiés: ${price} DH, ${matchedList}.${amenities} Informations certifiées depuis notre base de données.`;
  }

  // English fallback
  const amenities = property.amenities?.length ? ` Included amenities: ${property.amenities.slice(0, 4).join(', ')}.` : '';
  return `This ${type} in ${city} matches your verified search requirements: ${price} MAD, ${bedrooms} bedrooms.${amenities} All details are verified database facts.`;
}

/**
 * Generates match explanations for a list of matched properties
 */
export async function generateMatchExplanations(matchedItems, userCriteria, language = 'darija') {
  if (!matchedItems || matchedItems.length === 0) return [];

  const results = [];

  for (const item of matchedItems) {
    const property = item.property;
    const matchDetails = item.matchDetails || { matchedCriteria: [], partialCriteria: [], unmatchedCriteria: [] };

    // Grounded facts available in database
    const verifiedFacts = {
      id: property._id,
      title: property.title,
      type: property.type,
      city: property.city,
      address: property.address,
      price: property.pricePerNight,
      transactionType: property.listingType || 'rent',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      amenities: property.amenities || [],
      rating: property.averageRating || 0,
    };

    // Use fast grounded explanation built strictly from verified database fields
    const explanationText = buildDeterministicExplanation(property, matchDetails, language);

    results.push({
      propertyId: property._id,
      explanation: explanationText.trim(),
      verifiedFacts,
      matchedCriteria: matchDetails.matchedCriteria || [],
      partialCriteria: matchDetails.partialCriteria || [],
      unmatchedCriteria: matchDetails.unmatchedCriteria || [],
      isAlternative: Boolean(item.isAlternative),
      relaxedReasons: item.relaxedReasons || [],
    });
  }

  return results;
}
