const { Message, Conversation, User, File } = require('../models');
const { createNotificationUtil } = require('./notificationController');
const apiResponse = require('../utils/apiResponse');
const upload = require('../utils/fileUpload');
const fs = require('fs');
const path = require('path');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email role')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'attachments',
        }
      })
      .populate('groupAdmin', 'name email')
      .sort({ updatedAt: -1 });

    // Get unread counts for each conversation
    const conversationsWithUnread = conversations.map(conversation => {
      const conversationObj = conversation.toObject();

      // Get unread count for current user
      const unreadCount = conversation.unreadCounts.get(req.user.id.toString()) || 0;

      // Add unread count to conversation object
      conversationObj.unreadCount = unreadCount;

      return conversationObj;
    });

    const { statusCode, response } = apiResponse.success(
      'Conversations retrieved successfully',
      { conversations: conversationsWithUnread }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get or create a conversation with another user
// @route   POST /api/messages/conversations
// @access  Private
exports.createOrGetConversation = async (req, res, next) => {
  try {
    const { userId, isGroup, title, participants } = req.body;

    // Check if it's a group conversation
    if (isGroup) {
      // Validate group data
      if (!title) {
        const { statusCode, response } = apiResponse.error('Group title is required', 400);
        return res.status(statusCode).json(response);
      }

      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        const { statusCode, response } = apiResponse.error('Group participants are required', 400);
        return res.status(statusCode).json(response);
      }

      // Add current user to participants if not already included
      if (!participants.includes(req.user.id)) {
        participants.push(req.user.id);
      }

      // Create new group conversation
      const newConversation = await Conversation.create({
        participants,
        title,
        isGroup: true,
        groupAdmin: req.user.id,
      });

      // Populate the conversation
      const populatedConversation = await Conversation.findById(newConversation._id)
        .populate('participants', 'name email role')
        .populate('groupAdmin', 'name email');

      const { statusCode, response } = apiResponse.success(
        'Group conversation created successfully',
        { conversation: populatedConversation },
        201
      );

      return res.status(statusCode).json(response);
    } else {
      // For one-on-one conversations
      if (!userId) {
        const { statusCode, response } = apiResponse.error('User ID is required', 400);
        return res.status(statusCode).json(response);
      }

      // Check if user exists
      const user = await User.findById(userId);

      if (!user) {
        const { statusCode, response } = apiResponse.notFound('User not found');
        return res.status(statusCode).json(response);
      }

      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [req.user.id, userId], $size: 2 },
      })
        .populate('participants', 'name email role')
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'attachments',
          }
        });

      if (existingConversation) {
        const { statusCode, response } = apiResponse.success(
          'Conversation retrieved successfully',
          { conversation: existingConversation }
        );

        return res.status(statusCode).json(response);
      }

      // Create new conversation
      const newConversation = await Conversation.create({
        participants: [req.user.id, userId],
        isGroup: false,
      });

      // Populate the conversation
      const populatedConversation = await Conversation.findById(newConversation._id)
        .populate('participants', 'name email role');

      const { statusCode, response } = apiResponse.success(
        'Conversation created successfully',
        { conversation: populatedConversation },
        201
      );

      return res.status(statusCode).json(response);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if conversation exists
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      const { statusCode, response } = apiResponse.notFound('Conversation not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to access this conversation');
      return res.status(statusCode).json(response);
    }

    // Get total count
    const total = await Message.countDocuments({ conversation: id });

    // Get messages with pagination (newest first)
    const messages = await Message.find({ conversation: id })
      .populate('sender', 'name email role')
      .populate('attachments')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: id,
        recipient: req.user.id,
        read: false,
      },
      { read: true }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(
      id,
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } }
    );

    const { statusCode, response } = apiResponse.success(
      'Messages retrieved successfully',
      {
        messages,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, recipientId, content, attachments } = req.body;

    // Validate content
    if (!content && (!attachments || attachments.length === 0)) {
      const { statusCode, response } = apiResponse.error('Message content or attachments are required', 400);
      return res.status(statusCode).json(response);
    }

    let conversation;
    let recipient;

    // If conversationId is provided, use it
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        const { statusCode, response } = apiResponse.notFound('Conversation not found');
        return res.status(statusCode).json(response);
      }

      // Check if user is a participant
      if (!conversation.participants.includes(req.user.id)) {
        const { statusCode, response } = apiResponse.forbidden('Not authorized to send messages in this conversation');
        return res.status(statusCode).json(response);
      }

      // For group conversations, set recipient to null
      if (conversation.isGroup) {
        recipient = null;
      } else {
        // For one-on-one conversations, find the other participant
        recipient = conversation.participants.find(
          participant => participant.toString() !== req.user.id
        );
      }
    } else if (recipientId) {
      // If recipientId is provided, find or create a conversation
      recipient = recipientId;

      // Check if user exists
      const user = await User.findById(recipientId);

      if (!user) {
        const { statusCode, response } = apiResponse.notFound('Recipient not found');
        return res.status(statusCode).json(response);
      }

      // Check if conversation already exists
      conversation = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [req.user.id, recipientId], $size: 2 },
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Conversation.create({
          participants: [req.user.id, recipientId],
          isGroup: false,
        });
      }
    } else {
      const { statusCode, response } = apiResponse.error('Conversation ID or recipient ID is required', 400);
      return res.status(statusCode).json(response);
    }

    // Validate attachments if provided
    if (attachments && attachments.length > 0) {
      // Check if files exist and belong to the user
      for (const fileId of attachments) {
        const file = await File.findById(fileId);

        if (!file) {
          const { statusCode, response } = apiResponse.notFound(`File with ID ${fileId} not found`);
          return res.status(statusCode).json(response);
        }

        if (file.uploadedBy.toString() !== req.user.id) {
          const { statusCode, response } = apiResponse.forbidden(`Not authorized to use file with ID ${fileId}`);
          return res.status(statusCode).json(response);
        }

        // Update file with message type if not already set
        if (file.fileType !== 'message') {
          await File.findByIdAndUpdate(fileId, { fileType: 'message' });
        }
      }
    }

    // Create message
    const message = await Message.create({
      sender: req.user.id,
      recipient: conversation.isGroup ? null : recipient,
      conversation: conversation._id,
      content,
      attachments: attachments || [],
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(
      conversation._id,
      { lastMessage: message._id }
    );

    // Increment unread count for all participants except sender
    for (const participant of conversation.participants) {
      if (participant.toString() !== req.user.id) {
        const currentCount = conversation.unreadCounts.get(participant.toString()) || 0;
        await Conversation.findByIdAndUpdate(
          conversation._id,
          { $set: { [`unreadCounts.${participant}`]: currentCount + 1 } }
        );
      }
    }

    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('attachments');

    // Send real-time notification to recipient
    if (!conversation.isGroup && recipient) {
      // Send socket event
      if (req.app.get('io')) {
        req.app.get('io').to(recipient.toString()).emit('new-message', {
          message: populatedMessage,
          conversation: conversation._id,
        });
      }

      // Create notification
      await createNotificationUtil({
        recipient: recipient.toString(),
        sender: req.user.id,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${req.user.name}`,
        relatedModel: 'Conversation',
        relatedId: conversation._id,
        link: `/messages/${conversation._id}`,
      }, req.app.get('io'));
    } else if (conversation.isGroup) {
      // For group messages, notify all participants except sender
      for (const participant of conversation.participants) {
        if (participant.toString() !== req.user.id) {
          // Send socket event
          if (req.app.get('io')) {
            req.app.get('io').to(participant.toString()).emit('new-message', {
              message: populatedMessage,
              conversation: conversation._id,
            });
          }

          // Create notification
          await createNotificationUtil({
            recipient: participant.toString(),
            sender: req.user.id,
            type: 'message',
            title: 'New Group Message',
            message: `New message in ${conversation.title || 'group chat'}`,
            relatedModel: 'Conversation',
            relatedId: conversation._id,
            link: `/messages/${conversation._id}`,
          }, req.app.get('io'));
        }
      }
    }

    const { statusCode, response } = apiResponse.success(
      'Message sent successfully',
      { message: populatedMessage },
      201
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      const { statusCode, response } = apiResponse.notFound('Conversation not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is a participant
    if (!conversation.participants.includes(req.user.id)) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to access this conversation');
      return res.status(statusCode).json(response);
    }

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: req.user.id,
        read: false,
      },
      { read: true }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } }
    );

    const { statusCode, response } = apiResponse.success('Messages marked as read');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const message = await Message.findById(id);

    if (!message) {
      const { statusCode, response } = apiResponse.notFound('Message not found');
      return res.status(statusCode).json(response);
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete this message');
      return res.status(statusCode).json(response);
    }

    // Delete message
    await message.deleteOne();

    // Update lastMessage if this was the last message
    const conversation = await Conversation.findById(message.conversation);

    if (conversation && conversation.lastMessage &&
        conversation.lastMessage.toString() === id) {
      // Find the new last message
      const newLastMessage = await Message.findOne({ conversation: conversation._id })
        .sort({ createdAt: -1 });

      // Update conversation
      await Conversation.findByIdAndUpdate(
        conversation._id,
        { lastMessage: newLastMessage ? newLastMessage._id : null }
      );
    }

    const { statusCode, response } = apiResponse.success('Message deleted successfully');

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: req.user.id,
    });

    // Calculate total unread count
    let totalUnread = 0;

    for (const conversation of conversations) {
      const unreadCount = conversation.unreadCounts.get(req.user.id.toString()) || 0;
      totalUnread += unreadCount;
    }

    const { statusCode, response } = apiResponse.success(
      'Unread message count retrieved successfully',
      { count: totalUnread }
    );

    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
