const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const assessmentController = require('../controllers/assessmentController');

router.post('/create', auth, assessmentController.createAssessment);
router.post('/submit', auth, assessmentController.submitAssessment);

// Add this new route
router.get('/result/:id', auth, assessmentController.getAssessmentResult);

module.exports = router;
