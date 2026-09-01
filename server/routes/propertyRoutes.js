import express from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  uploadImages,
  deleteImage,
  getMyProperties,
} from '../controllers/propertyController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProperties);

// Owner's own properties — must come BEFORE /:id to avoid "owner" being matched as an id
router.get('/owner/my', authenticateUser, authorizeRoles('owner', 'admin'), getMyProperties);

router.get('/:id', getPropertyById);

// Protected routes (require auth)
router.use(authenticateUser);
router.post('/', authorizeRoles('owner', 'admin'), createProperty);
router.put('/:id', authorizeRoles('owner', 'admin'), updateProperty);
router.delete('/:id', authorizeRoles('owner', 'admin'), deleteProperty);

// Image routes
router.post(
  '/:id/images',
  authorizeRoles('owner', 'admin'),
  upload.array('images', 10),
  uploadImages
);
router.delete('/:id/images/:imageIndex', authorizeRoles('owner', 'admin'), deleteImage);

export default router;