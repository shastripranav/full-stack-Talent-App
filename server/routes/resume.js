const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const upload = require('../middleware/fileUpload');
const auth = require('../middleware/auth');

router.post('/upload', auth, upload.single('resume'), resumeController.uploadResume);
router.post('/analyze/:resumeId', auth, resumeController.analyzeResume);
router.get('/history', auth, resumeController.getResumeHistory);
router.get('/analysis/:resumeId', auth, resumeController.getAnalysis);

module.exports = router;
