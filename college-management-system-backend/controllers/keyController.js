const { User, Conversation } = require('../models');
const apiResponse = require('../utils/apiResponse');

// @desc    Update user's public key
// @route   PUT /api/keys/public
// @access  Private
exports.updatePublicKey = async (req, res, next) => {
  try {
    const { publicKey } = req.body;
    
    if (!publicKey) {
      const { statusCode, response } = apiResponse.badRequest('Public key is required');
      return res.status(statusCode).json(response);
    }
    
    // Update user's public key
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { publicKey },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      const { statusCode, response } = apiResponse.notFound('User not found');
      return res.status(statusCode).json(response);
    }
    
    const { statusCode, response } = apiResponse.success(
      'Public key updated successfully',
      { publicKey: user.publicKey }
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's public key
// @route   GET /api/keys/public/:userId
// @access  Private
exports.getPublicKey = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('publicKey');
    
    if (!user) {
      const { statusCode, response } = apiResponse.notFound('User not found');
      return res.status(statusCode).json(response);
    }
    
    const { statusCode, response } = apiResponse.success(
      'Public key retrieved successfully',
      { publicKey: user.publicKey }
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Store encrypted shared key for a conversation
// @route   PUT /api/keys/shared/:conversationId
// @access  Private
exports.storeSharedKey = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { encryptedKey } = req.body;
    
    if (!encryptedKey) {
      const { statusCode, response } = apiResponse.badRequest('Encrypted key is required');
      return res.status(statusCode).json(response);
    }
    
    // Find conversation
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
    
    // Update encrypted keys map
    const encryptedKeys = conversation.encryptedKeys || new Map();
    encryptedKeys.set(req.user.id.toString(), encryptedKey);
    
    // Save conversation
    conversation.encryptedKeys = encryptedKeys;
    await conversation.save();
    
    const { statusCode, response } = apiResponse.success(
      'Shared key stored successfully'
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get encrypted shared key for a conversation
// @route   GET /api/keys/shared/:conversationId
// @access  Private
exports.getSharedKey = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    
    // Find conversation
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
    
    // Get encrypted key for user
    const encryptedKeys = conversation.encryptedKeys || new Map();
    const encryptedKey = encryptedKeys.get(req.user.id.toString());
    
    const { statusCode, response } = apiResponse.success(
      'Shared key retrieved successfully',
      { 
        encryptedKey,
        isEncrypted: conversation.isEncrypted
      }
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
