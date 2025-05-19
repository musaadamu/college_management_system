const { Notification, User } = require('../models');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all notifications for the current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    // Get query parameters
    const { page = 1, limit = 10, read } = req.query;
    
    // Build query
    const query = { recipient: req.user.id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Count total notifications
    const total = await Notification.countDocuments(query);
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('sender', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const { statusCode, response } = apiResponse.success(
      'Notifications retrieved successfully',
      {
        notifications,
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

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      read: false,
    });
    
    const { statusCode, response } = apiResponse.success(
      'Unread notification count retrieved successfully',
      { count }
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      const { statusCode, response } = apiResponse.notFound('Notification not found');
      return res.status(statusCode).json(response);
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to update this notification');
      return res.status(statusCode).json(response);
    }
    
    // Update notification
    notification.read = true;
    await notification.save();
    
    const { statusCode, response } = apiResponse.success('Notification marked as read');
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    const { statusCode, response } = apiResponse.success('All notifications marked as read');
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      const { statusCode, response } = apiResponse.notFound('Notification not found');
      return res.status(statusCode).json(response);
    }
    
    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete this notification');
      return res.status(statusCode).json(response);
    }
    
    // Delete notification
    await notification.deleteOne();
    
    const { statusCode, response } = apiResponse.success('Notification deleted successfully');
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (admin only)
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to create notifications');
      return res.status(statusCode).json(response);
    }
    
    const { recipient, type, title, message, relatedModel, relatedId, link } = req.body;
    
    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    
    if (!recipientUser) {
      const { statusCode, response } = apiResponse.notFound('Recipient not found');
      return res.status(statusCode).json(response);
    }
    
    // Create notification
    const notification = await Notification.create({
      recipient,
      sender: req.user.id,
      type,
      title,
      message,
      relatedModel,
      relatedId,
      link,
    });
    
    // Emit socket event if socket.io is available
    if (req.app.get('io')) {
      req.app.get('io').to(recipient).emit('notification', notification);
    }
    
    const { statusCode, response } = apiResponse.success(
      'Notification created successfully',
      { notification },
      201
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification for multiple recipients (admin only)
// @route   POST /api/notifications/bulk
// @access  Private/Admin
exports.createBulkNotifications = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to create notifications');
      return res.status(statusCode).json(response);
    }
    
    const { recipients, type, title, message, relatedModel, relatedId, link } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      const { statusCode, response } = apiResponse.error('Recipients are required and must be an array', 400);
      return res.status(statusCode).json(response);
    }
    
    // Check if recipients exist
    const users = await User.find({ _id: { $in: recipients } });
    
    if (users.length !== recipients.length) {
      const { statusCode, response } = apiResponse.error('One or more recipients not found', 400);
      return res.status(statusCode).json(response);
    }
    
    // Create notifications
    const notifications = [];
    
    for (const recipient of recipients) {
      const notification = await Notification.create({
        recipient,
        sender: req.user.id,
        type,
        title,
        message,
        relatedModel,
        relatedId,
        link,
      });
      
      notifications.push(notification);
      
      // Emit socket event if socket.io is available
      if (req.app.get('io')) {
        req.app.get('io').to(recipient).emit('notification', notification);
      }
    }
    
    const { statusCode, response } = apiResponse.success(
      'Notifications created successfully',
      { count: notifications.length },
      201
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// Utility function to create a notification (for internal use)
exports.createNotificationUtil = async (data, io) => {
  try {
    const { recipient, sender, type, title, message, relatedModel, relatedId, link } = data;
    
    // Create notification
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedModel,
      relatedId,
      link,
    });
    
    // Emit socket event if socket.io is available
    if (io) {
      io.to(recipient).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
