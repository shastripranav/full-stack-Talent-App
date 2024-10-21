const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/send', chatbotController.sendMessage);
router.get('/history', chatbotController.getConversationHistory);

module.exports = router;
