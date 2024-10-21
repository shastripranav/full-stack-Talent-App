const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const assessmentController = require('../controllers/assessmentController');

router.post('/create', auth, assessmentController.createAssessment);
router.post('/submit', auth, assessmentController.submitAssessment);

module.exports = router;
