const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processInput, getInitialGreeting, processTextInput, getTodaysChatHistory } = require('../controllers/voiceAssistantController');
// Create uploads directory if it doesn't exist
const uploadDir = '/Users/pranavshastri/Desktop/Talent Harnessing App/server/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Log file details
    console.log('Incoming file:', file);
    cb(null, true);
  }
});

// POST process user's audio input
router.post('/process', 
    auth,
    upload.single('audio'), // 'audio' is the field name in formData
    (req, res, next) => {
      console.log('File upload details:', req.file); // Debug log
      next();
    },
    processInput
  );

// GET initial greeting when page loads
router.get('/greeting', auth, getInitialGreeting);



// POST process user's text input
router.post('/process-text', auth, processTextInput);

// GET today's chat history
router.get('/history/today', auth, getTodaysChatHistory);

module.exports = router;
