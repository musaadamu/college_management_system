const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  deleteFile,
} = require('../controllers/fileController');

// Routes
router.route('/')
  .get(protect, getFiles)
  .post(protect, uploadFile);

router.route('/:id')
  .get(protect, getFile)
  .delete(protect, deleteFile);

router.route('/:id/download')
  .get(protect, downloadFile);

module.exports = router;
