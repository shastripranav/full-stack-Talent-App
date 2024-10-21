const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

router.post('/generate', imageController.generateImage);
router.post('/upload', imageController.uploadImage);

module.exports = router;
