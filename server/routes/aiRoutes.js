import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleAiChat,
  handleAiSearch,
  handleAiCompare,
  handleAiBudget,
  handleAiAnalyzeListing,
  handleAiReset,
  handleAiStatus,
} from '../controllers/aiController.js';

const router = express.Router();

// Specific rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120, // 120 AI requests per 15 mins
  message: {
    success: false,
    message: 'Too many requests to ReserverDark AI assistant. Please wait a few moments.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(aiLimiter);

router.post('/chat', handleAiChat);
router.post('/search', handleAiSearch);
router.post('/compare', handleAiCompare);
router.post('/budget', handleAiBudget);
router.post('/analyze-listing', handleAiAnalyzeListing);
router.post('/reset', handleAiReset);
router.get('/status', handleAiStatus);

export default router;
