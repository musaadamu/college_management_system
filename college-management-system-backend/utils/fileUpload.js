const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create uploads directory if it doesn't exist
const createUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create subdirectories for different file types
  const dirs = ['messages', 'assignments', 'submissions', 'resources', 'profiles'];
  
  dirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  return uploadsDir;
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = createUploadsDir();
    
    // Determine subdirectory based on file type
    let subDir = 'resources'; // Default
    
    if (req.body.fileType) {
      if (req.body.fileType === 'message') {
        subDir = 'messages';
      } else if (req.body.fileType === 'assignment') {
        subDir = 'assignments';
      } else if (req.body.fileType === 'submission') {
        subDir = 'submissions';
      } else if (req.body.fileType === 'profile') {
        subDir = 'profiles';
      }
    } else if (req.baseUrl.includes('messages')) {
      subDir = 'messages';
    }
    
    cb(null, path.join(uploadsDir, subDir));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${uniqueSuffix}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  // You can add restrictions here if needed
  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
