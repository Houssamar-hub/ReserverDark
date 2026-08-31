import express from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  getUnreadCount,
  deleteMessage,
  sendMessage,
} from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

router.get('/unread/count', getUnreadCount);
router.post('/', sendMessage);
router.get('/:conversationId', getMessages);
router.delete('/:messageId', deleteMessage);

export default router;
