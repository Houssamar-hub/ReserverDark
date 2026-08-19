import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';

// @desc    Get user conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name avatar email')
      .sort({ updatedAt: -1 });

    // Get last message for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await Message.findOne({
          conversation: conversation._id,
        })
          .sort({ createdAt: -1 })
          .populate('sender', 'name avatar');

        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user._id },
          read: false,
        });

        return {
          ...conversation.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    res.status(200).json({ conversations: conversationsWithMessages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .populate('sender', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    // Marquer les messages comme lus
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        read: false,
      },
      { read: true }
    );

    res.status(200).json({
      messages: messages.reverse(),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create or get conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { participantId, propertyId } = req.body;

    // Vérifier que le participant existe
    const User = (await import('../models/User.js')).default;
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Vérifier que l'utilisateur peut discuter avec ce participant
    // Si propertyId est fourni, vérifier que l'utilisateur a une réservation ou est le propriétaire
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }

      // Vérifier si l'utilisateur a une réservation pour cette propriété
      const booking = await Booking.findOne({
        property: propertyId,
        $or: [
          { client: req.user._id },
          { owner: req.user._id },
        ],
      });

      if (!booking && req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'You must have a booking to chat with the owner/client' 
        });
      }
    }

    // Vérifier si une conversation existe déjà
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
      });
    }

    // Populate les participants
    conversation = await conversation.populate('participants', 'name avatar email');

    res.status(200).json({
      message: 'Conversation created successfully',
      conversation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    });

    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversations.map(c => c._id) },
      sender: { $ne: req.user._id },
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Seul l'expéditeur peut supprimer son message
    if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};