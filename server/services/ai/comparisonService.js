/**
 * @file comparisonService.js
 * @description Compares 2 or 3 actual properties side-by-side using real database data
 * and produces objective, trade-off summaries based on user priorities.
 */

import Property from '../../models/Property.js';
import gemmaProvider from './gemmaProvider.js';

export async function compareProperties(propertyIds, userPreferences = {}, language = 'fr') {
  if (!propertyIds || propertyIds.length < 2) {
    throw new Error('At least 2 property IDs are required for comparison');
  }

  // Fetch properties from database
  const properties = await Property.find({ _id: { $in: propertyIds } })
    .populate('owner', 'name email phone')
    .lean();

  if (properties.length < 2) {
    throw new Error('Could not find enough matching valid properties in database');
  }

  // Build matrix comparing facts
  const matrix = properties.map(p => ({
    id: p._id,
    title: p.title,
    city: p.city,
    location: p.location,
    type: p.type,
    listingType: p.listingType || 'rent',
    price: p.pricePerNight,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    maxGuests: p.maxGuests,
    amenities: p.amenities || [],
    rating: p.averageRating || 0,
    images: p.images || [],
    pricePerBedroom: p.bedrooms > 0 ? Math.round(p.pricePerNight / p.bedrooms) : p.pricePerNight,
  }));

  // Analyze trade-offs deterministically
  const lowestPrice = Math.min(...matrix.map(m => m.price));
  const highestPrice = Math.max(...matrix.map(m => m.price));
  const mostBedrooms = Math.max(...matrix.map(m => m.bedrooms));

  const deterministicAnalysis = {
    cheapest: matrix.find(m => m.price === lowestPrice)?.title,
    mostSpacious: matrix.find(m => m.bedrooms === mostBedrooms)?.title,
    priceDifferenceDh: highestPrice - lowestPrice,
  };

  let aiSummary = '';
  if (gemmaProvider.getStatus().isConfigured) {
    try {
      const systemInstruction = `
You are ReserverDark's Property Comparison Assistant.
Language: ${language}.
RULES:
1. Provide an objective, balanced trade-off analysis between the compared properties.
2. DO NOT declare one property as objectively the single best for everyone; highlight which fits specific preferences (e.g. budget conscious vs larger space vs amenities).
3. Base comparisons ONLY on the provided database facts.
4. Keep the summary under 120 words.
`;
      const prompt = `
Properties to compare:
${JSON.stringify(matrix, null, 2)}

User priorities:
${JSON.stringify(userPreferences)}

Generate comparison summary:
`;
      aiSummary = await gemmaProvider.generateText({ systemInstruction, prompt });
    } catch (err) {
      console.warn('⚠️ Comparison AI summary failed, using deterministic summary:', err.message);
    }
  }

  if (!aiSummary) {
    if (language === 'darija') {
      aiSummary = `المقارنة بين هاد العقارات: العقار الأنسب من ناحية الميزانية هو "${deterministicAnalysis.cheapest}" (${lowestPrice} درهم)، بينما "${deterministicAnalysis.mostSpacious}" كيوفر مساحة أكبر (${mostBedrooms} غرف). الاختيار كيعتمد على أولوياتك بين السعر والمساحة.`;
    } else if (language === 'ar') {
      aiSummary = `مقارنة العقارات: الخيار الأكثر اقتصاداً هو "${deterministicAnalysis.cheapest}" بسعر ${lowestPrice} درهم، في حين يتميز "${deterministicAnalysis.mostSpacious}" بسعة أكبر (${mostBedrooms} غرف). الاختيار الأمثل يعتمد على ميزانيتك وعدد الأفراد.`;
    } else {
      aiSummary = `Analyse comparative: Le bien le plus abordable est "${deterministicAnalysis.cheapest}" à ${lowestPrice} DH. Si vous privilégiez l'espace, "${deterministicAnalysis.mostSpacious}" offre ${mostBedrooms} chambres. Le meilleur choix dépend de votre équilibre entre budget et commodités.`;
    }
  }

  return {
    matrix,
    analysis: deterministicAnalysis,
    summary: aiSummary.trim(),
  };
}
