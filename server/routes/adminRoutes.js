import express from 'express';
import {
  getStats,
  getUsers,
  toggleBlockUser,
  getProperties,
  approveProperty,
  rejectProperty,
  getBookings,
  getReviews,
  deleteReview,
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles('admin'));

// Dashboard stats
router.get('/stats', getStats);

// Users management
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);

// Properties management
router.get('/properties', getProperties);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/reject', rejectProperty);

// Bookings management
router.get('/bookings', getBookings);

// Reviews management
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

export default router;