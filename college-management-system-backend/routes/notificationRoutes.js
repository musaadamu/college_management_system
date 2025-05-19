const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotifications,
} = require('../controllers/notificationController');

// Routes
router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/mark-all-read')
  .put(protect, markAllAsRead);

router.route('/bulk')
  .post(protect, createBulkNotifications);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router;
