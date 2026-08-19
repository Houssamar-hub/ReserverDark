import express from 'express';
import {
  createReview,
  getPropertyReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public - Get reviews for property
router.get('/property/:propertyId', getPropertyReviews);

// Protected - Create review
router.post('/', authenticateUser, authorizeRoles('client', 'admin'), createReview);

// Admin - Delete review
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteReview);

export default router;