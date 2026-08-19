import express from 'express';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from '../controllers/favoriteController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles('client', 'admin'));

router.post('/', addFavorite);
router.delete('/:propertyId', removeFavorite);
router.get('/', getFavorites);
router.get('/check/:propertyId', checkFavorite);

export default router;