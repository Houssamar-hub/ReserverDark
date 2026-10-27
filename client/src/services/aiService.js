import api from './api';

export const aiService = {
  // Conversational AI search with memory
  chat: async ({ message, sessionId, language }) => {
    const res = await api.post('/ai/chat', { message, sessionId, language });
    return res.data;
  },

  // Direct natural search
  search: async ({ query, language }) => {
    const res = await api.post('/ai/search', { query, language });
    return res.data;
  },

  // Property comparison
  compare: async ({ propertyIds, userPreferences, language }) => {
    const res = await api.post('/ai/compare', { propertyIds, userPreferences, language });
    return res.data;
  },

  // Budget advisor and affordability breakdown
  getBudget: async ({ propertyId, monthlyIncome, durationMonths }) => {
    const res = await api.post('/ai/budget', { propertyId, monthlyIncome, durationMonths });
    return res.data;
  },

  // Listing risk check
  analyzeListing: async ({ propertyId, userReportedPaymentRequest, language }) => {
    const res = await api.post('/ai/analyze-listing', {
      propertyId,
      userReportedPaymentRequest,
      language,
    });
    return res.data;
  },

  // Reset conversation
  reset: async (sessionId) => {
    const res = await api.post('/ai/reset', { sessionId });
    return res.data;
  },

  // AI Provider status
  getStatus: async () => {
    const res = await api.get('/ai/status');
    return res.data;
  },
};

export default aiService;
