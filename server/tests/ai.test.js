import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { extractCriteriaDeterministic } from '../services/ai/queryExtractor.js';
import { searchAndRankProperties } from '../services/ai/propertyMatcher.js';
import { generateMatchExplanations } from '../services/ai/explanationService.js';
import { compareProperties } from '../services/ai/comparisonService.js';
import { calculateHousingBudget } from '../services/ai/budgetAdvisor.js';
import { analyzeListingRisk } from '../services/ai/listingRiskService.js';
import conversationMemory from '../services/ai/conversationMemory.js';
import gemmaProvider from '../services/ai/gemmaProvider.js';
import Property from '../models/Property.js';
import {
  handleAiChat,
  handleAiSearch,
  handleAiCompare,
  handleAiBudget,
  handleAiAnalyzeListing,
  handleAiReset,
  handleAiStatus,
} from '../controllers/aiController.js';

// Mock real property database records
const MOCK_PROPERTIES = [
  {
    _id: '6b0000000000000000000001',
    title: 'Appartement Moderne avec Balcon Centre-Ville',
    description: 'Bel appartement meublé et lumineux situé au centre-ville de Beni Mellal avec grand balcon et finitions soignées.',
    type: 'Appartement',
    listingType: 'rent',
    pricePerNight: 240,
    location: 'Centre-Ville, Beni Mellal',
    address: 'Boulevard Mohammed V, Beni Mellal',
    city: 'Beni Mellal',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    ],
    amenities: ['WiFi', 'Balcon', 'Climatisation', 'Cuisine équipée'],
    status: 'approved',
    averageRating: 4.8,
  },
  {
    _id: '6b0000000000000000000002',
    title: 'Appartement Économique Quartier Al Qods',
    description: 'Appartement confortable de 2 chambres à Beni Mellal sans balcon.',
    type: 'Appartement',
    listingType: 'rent',
    pricePerNight: 200,
    location: 'Al Qods, Beni Mellal',
    address: 'Rue Al Massira, Beni Mellal',
    city: 'Beni Mellal',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858',
    ],
    amenities: ['WiFi', 'Cuisine équipée'],
    status: 'approved',
    averageRating: 4.3,
  },
  {
    _id: '6b0000000000000000000003',
    title: 'Studio Cosy Proche Université Sultan Moulay Slimane',
    description: 'Studio fonctionnel entièrement équipé à deux pas du campus universitaire de Beni Mellal.',
    type: 'Studio',
    listingType: 'rent',
    pricePerNight: 150,
    location: 'Quartier Universitaire, Beni Mellal',
    address: 'Avenue de la Marche Verte, Beni Mellal',
    city: 'Beni Mellal',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    ],
    amenities: ['WiFi', 'Cuisine équipée'],
    status: 'approved',
    averageRating: 4.6,
  },
  {
    _id: '6b0000000000000000000004',
    title: 'Maison Familiale avec Terrasse à Vendre',
    description: 'Magnifique maison de 3 chambres à vendre à Casablanca Maarif avec belle terrasse.',
    type: 'Maison',
    listingType: 'sale',
    pricePerNight: 1850000,
    location: 'Maarif, Casablanca',
    address: 'Rue Jean Jaurès, Casablanca',
    city: 'Casablanca',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    ],
    amenities: ['Terrasse', 'Garage', 'Cuisine équipée'],
    status: 'approved',
    averageRating: 4.9,
  },
  {
    _id: '6b0000000000000000000099',
    title: 'Propriété Rejetée Non Publique',
    description: 'Logement en attente ou rejeté par modération.',
    type: 'Appartement',
    listingType: 'rent',
    pricePerNight: 100,
    city: 'Beni Mellal',
    status: 'rejected',
  },
];

// Helper to mock Express req & res
function createMockReqRes(body = {}, query = {}, params = {}) {
  const req = { body, query, params, user: null };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return { req, res };
}

describe('ReserverDark AI Assistant Comprehensive Test Suite', () => {
  beforeEach(() => {
    // Mock Property.find to return our mock properties
    jest.spyOn(Property, 'find').mockImplementation((query = {}) => {
      let filtered = [...MOCK_PROPERTIES];

      if (query._id && query._id.$in) {
        filtered = filtered.filter(p => query._id.$in.includes(p._id));
      }
      if (query._id && query._id.$ne) {
        filtered = filtered.filter(p => p._id !== query._id.$ne);
      }
      if (query.status) {
        filtered = filtered.filter(p => p.status === query.status);
      }
      if (query.city) {
        if (query.city.$regex) {
          filtered = filtered.filter(p => query.city.$regex.test(p.city));
        } else if (typeof query.city === 'string') {
          filtered = filtered.filter(p => p.city.toLowerCase() === query.city.toLowerCase());
        }
      }
      if (query.listingType) {
        filtered = filtered.filter(p => p.listingType === query.listingType);
      }
      if (query.type) {
        filtered = filtered.filter(p => p.type === query.type);
      }
      if (query.bedrooms && query.bedrooms.$gte) {
        filtered = filtered.filter(p => p.bedrooms >= query.bedrooms.$gte);
      }
      if (query.pricePerNight && query.pricePerNight.$lte) {
        filtered = filtered.filter(p => p.pricePerNight <= query.pricePerNight.$lte);
      }

      return {
        populate: () => ({
          lean: async () => filtered,
          limit: (n) => ({
            lean: async () => filtered.slice(0, n),
          }),
        }),
        select: () => ({
          lean: async () => filtered,
        }),
        limit: (n) => ({
          lean: async () => filtered.slice(0, n),
        }),
        lean: async () => filtered,
      };
    });

    jest.spyOn(Property, 'findById').mockImplementation((id) => {
      const found = MOCK_PROPERTIES.find(p => p._id === id);
      return {
        lean: async () => found || null,
      };
    });
  });

  // 1. Natural Language Criteria Extraction
  describe('Natural Language Criteria Extraction', () => {
    it('extracts rental requirements from Moroccan Darija query', () => {
      const query = 'Bghit appartement lkra f Beni Mellal, max 2500 dh, fih juj dyal lbitat.';
      const criteria = extractCriteriaDeterministic(query);

      expect(criteria.transactionType).toBe('rent');
      expect(criteria.city).toBe('Beni Mellal');
      expect(criteria.propertyType).toBe('Appartement');
      expect(criteria.maxPrice).toBe(2500);
      expect(criteria.minBedrooms).toBe(2);
      expect(criteria.detectedLanguage).toBe('darija');
    });

    it('extracts purchase requirements from French query', () => {
      const query = 'Je cherche une maison à vendre à Casablanca avec trois chambres.';
      const criteria = extractCriteriaDeterministic(query);

      expect(criteria.transactionType).toBe('sale');
      expect(criteria.city).toBe('Casablanca');
      expect(criteria.propertyType).toBe('Maison');
      expect(criteria.minBedrooms).toBe(3);
      expect(criteria.detectedLanguage).toBe('fr');
    });

    it('extracts studio requirements from Arabic query', () => {
      const query = 'بغيت ستوديو للكراء قريب من الجامعة وبثمن مناسب أقل من 2000 درهم';
      const criteria = extractCriteriaDeterministic(query);

      expect(criteria.transactionType).toBe('rent');
      expect(criteria.propertyType).toBe('Studio');
      expect(criteria.maxPrice).toBe(2000);
      expect(criteria.detectedLanguage).toBe('darija');
    });

    it('extracts requirements and amenities from English query', () => {
      const query = 'I need an apartment for rent in Beni Mellal with two bedrooms and a balcony.';
      const criteria = extractCriteriaDeterministic(query);

      expect(criteria.transactionType).toBe('rent');
      expect(criteria.city).toBe('Beni Mellal');
      expect(criteria.propertyType).toBe('Appartement');
      expect(criteria.minBedrooms).toBe(2);
      expect(criteria.amenities).toContain('Balcon');
      expect(criteria.detectedLanguage).toBe('en');
    });

    it('handles ambiguous queries without guessing missing criteria', () => {
      const query = 'salam khoya';
      const criteria = extractCriteriaDeterministic(query);

      expect(criteria.city).toBeNull();
      expect(criteria.maxPrice).toBeNull();
      expect(criteria.propertyType).toBeNull();
      expect(criteria.minBedrooms).toBeNull();
    });
  });

  // 2. Multi-turn Conversational Memory & Refinement
  describe('Conversational Memory & Refinement', () => {
    it('maintains and updates context over multi-turn conversation', () => {
      const sessionId = 'test_refine_sess';
      conversationMemory.resetSession(sessionId);

      // Turn 1: Initial query
      const t1 = extractCriteriaDeterministic('Bghit appartement lkra f Beni Mellal max 2500 dh');
      const s1 = conversationMemory.mergeCriteria(sessionId, t1);
      expect(s1.city).toBe('Beni Mellal');
      expect(s1.maxPrice).toBe(2500);
      expect(s1.propertyType).toBe('Appartement');
      expect(s1.amenities).toEqual([]);

      // Turn 2: User adds balcony requirement
      const t2 = extractCriteriaDeterministic('Wakha, khasni balcon.', s1);
      const s2 = conversationMemory.mergeCriteria(sessionId, t2);
      expect(s2.city).toBe('Beni Mellal');
      expect(s2.maxPrice).toBe(2500);
      expect(s2.amenities).toContain('Balcon');

      // Turn 3: User updates budget
      const t3 = extractCriteriaDeterministic('Khlli budget 3000.', s2);
      const s3 = conversationMemory.mergeCriteria(sessionId, t3);
      expect(s3.city).toBe('Beni Mellal');
      expect(s3.maxPrice).toBe(3000);
      expect(s3.amenities).toContain('Balcon');
    });
  });

  // 3. Database Search, Filtering & Ranking
  describe('Database Matching & Strict Validation', () => {
    it('strictly filters by city, budget, and excludes rejected listings', async () => {
      const criteria = {
        city: 'Beni Mellal',
        transactionType: 'rent',
        maxPrice: 250,
        propertyType: 'Appartement',
        minBedrooms: 2,
        amenities: [],
      };

      const result = await searchAndRankProperties(criteria);
      expect(result.status).toBe('exact_matches_found');
      expect(result.count).toBe(2);

      // Verify no rejected properties are returned
      result.properties.forEach(item => {
        expect(item.property.status).toBe('approved');
        expect(item.property.city).toBe('Beni Mellal');
        expect(item.property.pricePerNight).toBeLessThanOrEqual(250);
      });
    });

    it('prioritizes listings with requested amenities', async () => {
      const criteriaWithBalcony = {
        city: 'Beni Mellal',
        transactionType: 'rent',
        maxPrice: 250,
        propertyType: 'Appartement',
        minBedrooms: 2,
        amenities: ['Balcon'],
      };

      const result = await searchAndRankProperties(criteriaWithBalcony);
      expect(result.status).toBe('exact_matches_found');
      expect(result.properties[0].property._id).toBe('6b0000000000000000000001');
      expect(result.properties[0].property.amenities).toContain('Balcon');
    });

    it('handles no-results and provides clearly labeled alternatives', async () => {
      const strictCriteria = {
        city: 'Beni Mellal',
        transactionType: 'rent',
        maxPrice: 120, // Lower than all 2-bed apartments
        propertyType: 'Appartement',
        minBedrooms: 2,
      };

      const result = await searchAndRankProperties(strictCriteria, { allowAlternatives: true });
      expect(result.status).toBe('no_exact_matches');
      expect(result.count).toBe(0);
      expect(result.hasAlternatives).toBe(true);
      expect(result.blockedCriteria).toContain('Budget maximum');
    });
  });

  // 4. Property Match Explanations
  describe('Match Explanations Service', () => {
    it('generates grounded explanation using verified database fields', async () => {
      const item = {
        property: MOCK_PROPERTIES[0],
        matchDetails: {
          matchedCriteria: ['Ville: Beni Mellal', 'Budget: 240 DH', 'Chambres: 2', 'Équipement: Balcon'],
          partialCriteria: [],
          unmatchedCriteria: [],
        },
      };

      const explanations = await generateMatchExplanations([item], { city: 'Beni Mellal' }, 'fr');
      expect(explanations.length).toBe(1);
      expect(explanations[0].propertyId).toBe(MOCK_PROPERTIES[0]._id);
      expect(explanations[0].explanation).toContain('Beni Mellal');
      expect(explanations[0].explanation).toContain('240 DH');
      expect(explanations[0].verifiedFacts.bedrooms).toBe(2);
    });
  });

  // 5. Property Comparison
  describe('Property Comparison Service', () => {
    it('compares properties side-by-side with objective trade-offs', async () => {
      const ids = ['6b0000000000000000000001', '6b0000000000000000000002'];
      const result = await compareProperties(ids, {}, 'fr');

      expect(result.matrix.length).toBe(2);
      expect(result.analysis.priceDifferenceDh).toBe(40);
      expect(result.summary).toBeDefined();
    });

    it('rejects comparison with fewer than 2 properties', async () => {
      await expect(compareProperties(['6b0000000000000000000001'])).rejects.toThrow();
    });
  });

  // 6. Housing Budget & Affordability
  describe('Housing Budget Advisor', () => {
    it('calculates rental move-in costs with transparent formulas', async () => {
      const budget = await calculateHousingBudget('6b0000000000000000000001', {
        monthlyIncome: 8000,
      });

      expect(budget.type).toBe('rent');
      expect(budget.basePricePerUnit).toBe(240);
      expect(budget.totalMoveInEstimate).toBe(480); // 240 rent + 240 deposit
      expect(budget.affordabilityAssessment.status).toBe('healthy');
      expect(budget.disclaimer).toBeDefined();
    });

    it('calculates statutory acquisition costs for property purchase', async () => {
      const budget = await calculateHousingBudget('6b0000000000000000000004');

      expect(budget.type).toBe('sale');
      expect(budget.purchasePrice).toBe(1850000);
      const regItem = budget.breakdown.find(b => b.label.includes('enregistrement'));
      expect(regItem.amount).toBe(74000);
      expect(budget.totalEstimatedAcquisition).toBeGreaterThan(1850000);
    });
  });

  // 7. Listing Risk Assistant
  describe('Listing Risk Assistant', () => {
    it('detects low risk on complete listing', async () => {
      const risk = await analyzeListingRisk('6b0000000000000000000001', false);
      expect(risk.riskLevel).toBe('Faible');
      expect(risk.recommendedVerificationSteps.length).toBeGreaterThan(0);
    });

    it('flags high risk when user reports advance payment request before visit', async () => {
      const risk = await analyzeListingRisk('6b0000000000000000000001', true);
      expect(risk.riskLevel).toBe('Élevé');
      const advanceWarning = risk.indicators.find(i => i.type === 'advance_payment_request');
      expect(advanceWarning).toBeDefined();
      expect(advanceWarning.level).toBe('high');
    });
  });

  // 8. Controller Endpoints Handler Verification
  describe('AI Controller Handlers', () => {
    it('handleAiStatus returns provider status', () => {
      const { req, res } = createMockReqRes();
      handleAiStatus(req, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.provider).toContain('Google Gemma');
    });

    it('handleAiChat handles conversational search and returns safe properties', async () => {
      const { req, res } = createMockReqRes({
        message: 'Bghit appartement lkra f Beni Mellal max 2500 dh fih 2 lbitat',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.criteria.city).toBe('Beni Mellal');
      expect(res.body.properties.length).toBeGreaterThan(0);
      expect(res.body.reply).toBeDefined();
    });

    it('handleAiCompare compares properties via controller', async () => {
      const { req, res } = createMockReqRes({
        propertyIds: ['6b0000000000000000000001', '6b0000000000000000000002'],
      });
      await handleAiCompare(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.matrix.length).toBe(2);
    });

    it('handleAiBudget returns transparent cost breakdown', async () => {
      const { req, res } = createMockReqRes({
        propertyId: '6b0000000000000000000001',
        monthlyIncome: 6000,
      });
      await handleAiBudget(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.budget.breakdown.length).toBeGreaterThan(0);
    });

    it('handleAiAnalyzeListing returns risk analysis', async () => {
      const { req, res } = createMockReqRes({
        propertyId: '6b0000000000000000000001',
        userReportedPaymentRequest: false,
      });
      await handleAiAnalyzeListing(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.analysis.riskLevel).toBeDefined();
    });

    it('handleAiReset resets conversation memory', async () => {
      const { req, res } = createMockReqRes({ sessionId: 'test_sess' });
      await handleAiReset(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('responds naturally like a human to greetings without dumping properties', async () => {
      const { req, res } = createMockReqRes({
        message: 'salam 3laikom',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.totalMatches).toBe(0);
      expect(res.body.reply.toLowerCase()).toMatch(/(salam|marhba|ahlan)/);
    });

    it('responds conversationally to identity questions (chkon nta)', async () => {
      const { req, res } = createMockReqRes({
        message: 'chkon nta o chnou kaddir?',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply.toLowerCase()).toMatch(/(reserverdark|moussa3id|conseil)/);
    });

    it('provides insightful city advice for Beni Mellal without dumping properties', async () => {
      const { req, res } = createMockReqRes({
        message: 'chhal kaydir lkra f Beni Mellal o kifach dayra lmdina?',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply).toMatch(/(Beni Mellal|Asserdoun|studio|DH)/i);
    });

    it('explains booking and rental procedure conversationally', async () => {
      const { req, res } = createMockReqRes({
        message: 'kifach n-kri dar f l-site?',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply).toMatch(/(ReserverDark|3a9d|contrat|Réserver)/i);
    });

    it('handles onboarding interview requests (sawlni achno khassni) without dumping properties', async () => {
      const { req, res } = createMockReqRes({
        message: 't9dar t3awni nl9a chi dar mzna mohim nta sawlni achno khassni o ana njawbk',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply).toMatch(/(مدينة|كتقلب|الميزانية|questions|ville)/i);
    });

    it('handles user corrections (ba9i ma3titkch achno baghi) gracefully and resets filters', async () => {
      const { req, res } = createMockReqRes({
        message: 'wwalkin ana ba9i ma3titkch achno baghi',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply).toMatch(/(سمح ليا|عندك|حق|pardon|écoute)/i);
    });

    it('handles check-in calls (allo) warmly without dumping properties', async () => {
      const { req, res } = createMockReqRes({
        message: 'allo',
      });
      await handleAiChat(req, res, () => {});

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties.length).toBe(0);
      expect(res.body.reply).toMatch(/(ألو|معاك|كنسمعك|écoute|hello)/i);
    });
  });
});
