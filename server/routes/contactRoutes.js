import express from 'express';
import { submitContactMessage, getContactMessages } from '../controllers/contactController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route to submit contact form
router.post('/', submitContactMessage);

// Admin route to view received messages
router.get('/', authenticateUser, authorizeRoles('admin'), getContactMessages);

export default router;
