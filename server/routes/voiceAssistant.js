const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { processInput } = require('../controllers/voiceassistantController');

// POST /api/voiceassistant/process
router.post('/process', auth, processInput);

module.exports = router;
