const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Participants are required'],
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    title: {
      type: String,
      trim: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    encryptedKeys: {
      type: Map,
      of: String,
      default: {},
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ConversationSchema.index({ participants: 1 });

// Ensure participants are unique
ConversationSchema.pre('save', function (next) {
  if (this.isModified('participants')) {
    // Remove duplicates
    this.participants = [...new Set(this.participants.map(p => p.toString()))];
  }
  next();
});

module.exports = mongoose.model('Conversation', ConversationSchema);
