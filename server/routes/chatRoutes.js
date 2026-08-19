import express from 'express';
import {
  getConversations,
  getMessages,
  createConversation,
  getUnreadCount,
  deleteMessage,
} from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

router.get('/messages/:conversationId', getMessages);
router.delete('/messages/:messageId', deleteMessage);

router.get('/messages/unread/count', getUnreadCount);

export default router;