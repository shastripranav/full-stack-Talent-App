const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post(
  '/signup',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number is required').not().isEmpty(),
    check('dateOfBirth', 'Date of birth is required').isISO8601().toDate(),
    check('gender', 'Gender is required').isIn(['male', 'female', 'other', 'prefer-not-to-say']),
    check('education', 'Education is required').isIn(['high-school', 'bachelors', 'masters', 'phd', 'other']),
    check('occupation', 'Occupation is required').not().isEmpty()
  ],
  authController.signup
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/user
// @desc    Get user details
// @access  Private
router.get('/user', auth, authController.getUserDetails);

// @route   PUT api/user
// @desc    Update user details
// @access  Private
router.put('/user', [
  auth,
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('phoneNumber', 'Phone number is required').optional().not().isEmpty(),
    check('dateOfBirth', 'Date of birth is required').optional().isISO8601().toDate(),
    check('gender', 'Gender is required').optional().isIn(['male', 'female', 'other', 'prefer-not-to-say']),
    check('education', 'Education is required').optional().isIn(['high-school', 'bachelors', 'masters', 'phd', 'other']),
    check('occupation', 'Occupation is required').optional().not().isEmpty(),
    check('profilePicture', 'Profile picture must be a valid URL').optional().isURL()
  ]
], authController.updateUserDetails);

// @route   GET api/user/activity
// @desc    Get user activity
// @access  Private
router.get('/user/activity', auth, authController.getUserActivity);

router.get('/assessmentResult/:assessmentId', auth, authController.getAssessmentResult);

module.exports = router;
