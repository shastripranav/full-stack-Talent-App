const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { processInput, getInitialGreeting, processTextInput, getTodaysChatHistory } = require('../controllers/voiceAssistantController');

// GET initial greeting when page loads
router.get('/greeting', auth, getInitialGreeting);

// POST process user's audio input
router.post('/process', 
  auth, 
  express.raw({ 
    type: 'audio/wav',
    limit: '50mb'
  }), 
  processInput
);

// POST process user's text input
router.post('/process-text', auth, processTextInput);

// GET today's chat history
router.get('/history/today', auth, getTodaysChatHistory);

module.exports = router;
