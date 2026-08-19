import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware pour authentifier les connexions Socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);

    // Joindre la room de l'utilisateur
    socket.join(`user_${socket.userId}`);

    // Gestion des messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, receiverId } = data;
        
        // Créer le message dans la base de données
        const Message = (await import('../models/Message.js')).default;
        const Conversation = (await import('../models/Conversation.js')).default;
        const Notification = (await import('../models/Notification.js')).default;

        // Vérifier la conversation
        let conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          // Créer une nouvelle conversation
          conversation = await Conversation.create({
            participants: [socket.userId, receiverId],
            lastMessage: content,
          });
        }

        // Créer le message
        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.userId,
          content,
          read: false,
        });

        // Mettre à jour le dernier message
        conversation.lastMessage = content;
        await conversation.save();

        // Populate le message
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar');

        // Émettre le message au sender
        socket.emit('message_sent', populatedMessage);

        // Émettre le message au receiver
        io.to(`user_${receiverId}`).emit('receive_message', populatedMessage);

        // Créer une notification pour le receiver
        await Notification.create({
          user: receiverId,
          title: 'New Message',
          message: `${socket.user.name} vous a envoyé un message`,
          type: 'new_message',
        });

        // Notifier le receiver
        io.to(`user_${receiverId}`).emit('new_message_notification', {
          sender: socket.user,
          message: populatedMessage,
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: error.message });
      }
    });

    // Marquer un message comme lu
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;
        const Message = (await import('../models/Message.js')).default;

        await Message.findByIdAndUpdate(messageId, { read: true });
        
        // Notifier le sender que le message a été lu
        const message = await Message.findById(messageId);
        io.to(`user_${message.sender}`).emit('message_read', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, conversationId } = data;
      socket.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        name: socket.user.name,
        conversationId,
      });
    });

    socket.on('stop_typing', (data) => {
      const { receiverId, conversationId } = data;
      socket.to(`user_${receiverId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};