const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const {
  uploadAttachments,
  getAttachments,
  deleteAttachment,
} = require('../controllers/messageAttachmentController');

// Routes
router.route('/conversations')
  .get(protect, getConversations)
  .post(protect, createOrGetConversation);

router.route('/conversations/:id')
  .get(protect, getMessages);

router.route('/read/:conversationId')
  .put(protect, markAsRead);

router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/')
  .post(protect, sendMessage);

router.route('/:id')
  .delete(protect, deleteMessage);

// Attachment routes
router.route('/attachments')
  .get(protect, getAttachments)
  .post(protect, uploadAttachments);

router.route('/attachments/:id')
  .delete(protect, deleteAttachment);

module.exports = router;
