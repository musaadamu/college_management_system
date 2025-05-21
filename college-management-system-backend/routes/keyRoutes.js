const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  updatePublicKey,
  getPublicKey,
  storeSharedKey,
  getSharedKey,
} = require('../controllers/keyController');

// Public key routes
router.route('/public')
  .put(protect, updatePublicKey);

router.route('/public/:userId')
  .get(protect, getPublicKey);

// Shared key routes
router.route('/shared/:conversationId')
  .get(protect, getSharedKey)
  .put(protect, storeSharedKey);

module.exports = router;
