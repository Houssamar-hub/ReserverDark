import express from 'express';
import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
} from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

// Client routes
router.post('/', authorizeRoles('client', 'admin'), createBooking);
router.get('/my', authorizeRoles('client', 'admin'), getMyBookings);
router.delete('/:id/cancel', authorizeRoles('client', 'admin'), cancelBooking);

// Owner routes
router.get('/owner', authorizeRoles('owner', 'admin'), getOwnerBookings);
router.get('/stats', authorizeRoles('owner', 'admin'), getBookingStats);
router.patch('/:id/status', authorizeRoles('owner', 'admin'), updateBookingStatus);

export default router;