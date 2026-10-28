import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  sessionId: z.string().optional(),
  apiKey: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
      timestamp: z.string().optional(),
    })
  ).optional().default([]),
  language: z.enum(['darija', 'ar', 'fr', 'en']).optional(),
});

export const searchCriteriaSchema = z.object({
  transactionType: z.enum(['rent', 'sale']).nullable().optional(),
  city: z.string().nullable().optional(),
  minPrice: z.number().nonnegative().nullable().optional(),
  maxPrice: z.number().positive().nullable().optional(),
  propertyType: z.enum(['Appartement', 'Villa', 'Maison', 'Studio', 'Chambre', 'Riad', 'Autre']).nullable().optional(),
  minBedrooms: z.number().int().nonnegative().nullable().optional(),
  minBathrooms: z.number().int().nonnegative().nullable().optional(),
  minGuests: z.number().int().positive().nullable().optional(),
  amenities: z.array(z.string()).default([]),
  removeAmenities: z.array(z.string()).default([]),
  clearAmenities: z.boolean().default(false),
  clearAllFilters: z.boolean().default(false),
  clearMaxPrice: z.boolean().default(false),
  clearMinPrice: z.boolean().default(false),
  clearCity: z.boolean().default(false),
  clearPropertyType: z.boolean().default(false),
  sortPreference: z.enum(['best_match', 'price_asc', 'price_desc', 'rating']).default('best_match'),
  intent: z.enum([
    'search',
    'compare',
    'budget',
    'risk_check',
    'clarification',
    'general_chat',
    'greeting',
    'identity',
    'chitchat',
    'faq_platform',
    'real_estate_advice',
    'city_guide',
    'browse',
    'general_qa',
    'interview_request',
    'user_correction',
    'ping_allo',
    'weather',
    'programming',
    'mathematics',
    'translation',
    'sports',
    'mixed',
  ]).default('search'),
  isAmbiguous: z.boolean().default(false),
  clarificationQuestion: z.string().nullable().optional(),
  detectedLanguage: z.enum(['darija', 'ar', 'fr', 'en']).default('darija'),
});

export const compareRequestSchema = z.object({
  propertyIds: z.array(z.string()).min(2, 'At least 2 properties required').max(4, 'Maximum 4 properties can be compared'),
  userPreferences: z.record(z.any()).optional(),
  language: z.enum(['darija', 'ar', 'fr', 'en']).optional().default('fr'),
});

export const budgetRequestSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  monthlyIncome: z.number().positive().optional(),
  durationMonths: z.number().int().positive().optional().default(1),
  transactionType: z.enum(['rent', 'sale']).optional(),
  language: z.enum(['darija', 'ar', 'fr', 'en']).optional().default('fr'),
});

export const riskAnalysisSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  userReportedPaymentRequest: z.boolean().optional().default(false),
  language: z.enum(['darija', 'ar', 'fr', 'en']).optional().default('fr'),
});
