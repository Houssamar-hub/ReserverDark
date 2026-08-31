import express from 'express';
import { updateProfile, updatePassword, uploadAvatar } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { uploadAvatarFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.post('/avatar', uploadAvatarFile.single('avatar'), uploadAvatar);

export default router;
