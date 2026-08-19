import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: '',
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour optimiser les requêtes
conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;