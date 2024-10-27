const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

router.post('/create',auth, courseController.generateCourseOutline);
router.get('/:id', auth, courseController.getCourse);

module.exports = router;
