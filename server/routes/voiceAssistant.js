const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { processInput, getInitialGreeting } = require('../controllers/voiceAssistantController');

// GET initial greeting when page loads
router.get('/greeting', auth, getInitialGreeting);

// POST process user's audio input
router.post('/process', auth, express.raw({type: 'application/octet-stream', limit: '1mb'}), processInput);

module.exports = router;
