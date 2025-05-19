const { File } = require('../models');
const upload = require('../utils/fileUpload');
const apiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

// Multer middleware for file upload
const uploadMiddleware = upload.array('files', 5); // Allow up to 5 files

// @desc    Upload message attachments
// @route   POST /api/messages/attachments
// @access  Private
exports.uploadAttachments = async (req, res, next) => {
  uploadMiddleware(req, res, async (err) => {
    try {
      if (err) {
        const { statusCode, response } = apiResponse.error(
          err.message || 'Error uploading files',
          400
        );
        return res.status(statusCode).json(response);
      }
      
      if (!req.files || req.files.length === 0) {
        const { statusCode, response } = apiResponse.error(
          'No files uploaded',
          400
        );
        return res.status(statusCode).json(response);
      }
      
      // Process uploaded files
      const uploadedFiles = [];
      
      for (const file of req.files) {
        // Create file record in database
        const fileData = {
          name: req.body.name || file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/messages/${path.basename(file.path)}`,
          uploadedBy: req.user.id,
          fileType: 'message',
          isPublic: false,
        };
        
        const newFile = await File.create(fileData);
        uploadedFiles.push(newFile);
      }
      
      const { statusCode, response } = apiResponse.success(
        'Files uploaded successfully',
        { files: uploadedFiles },
        201
      );
      
      res.status(statusCode).json(response);
    } catch (error) {
      // Clean up uploaded files if there's an error
      if (req.files) {
        for (const file of req.files) {
          fs.unlink(file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
      }
      
      next(error);
    }
  });
};

// @desc    Get message attachments
// @route   GET /api/messages/attachments
// @access  Private
exports.getAttachments = async (req, res, next) => {
  try {
    const { messageId } = req.query;
    
    // Build query
    const query = { 
      fileType: 'message',
      uploadedBy: req.user.id
    };
    
    if (messageId) {
      query.message = messageId;
    }
    
    // Get files
    const files = await File.find(query)
      .sort({ createdAt: -1 });
    
    const { statusCode, response } = apiResponse.success(
      'Files retrieved successfully',
      { files }
    );
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message attachment
// @route   DELETE /api/messages/attachments/:id
// @access  Private
exports.deleteAttachment = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      const { statusCode, response } = apiResponse.notFound('File not found');
      return res.status(statusCode).json(response);
    }
    
    // Check if user is the owner
    if (file.uploadedBy.toString() !== req.user.id) {
      const { statusCode, response } = apiResponse.forbidden('Not authorized to delete this file');
      return res.status(statusCode).json(response);
    }
    
    // Delete file from storage
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    
    // Delete file from database
    await file.deleteOne();
    
    const { statusCode, response } = apiResponse.success('File deleted successfully');
    
    res.status(statusCode).json(response);
  } catch (error) {
    next(error);
  }
};
