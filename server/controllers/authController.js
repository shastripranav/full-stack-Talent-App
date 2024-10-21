const User = require('../models/User');
const Assessment = require('../models/Assessment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phoneNumber, dateOfBirth, gender, education, occupation } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      education,
      occupation
    });

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email }).populate('lastAssessment');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Update last login
    const previousLogin = user.lastLogin;
    user.lastLogin = new Date();
    await user.save();

    const payload = {
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            lastLogin: previousLogin,
            lastAssessment: user.lastAssessment
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('assessmentsTaken');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userActivity = {
      lastLogin: user.lastLogin,
      assessmentsTaken: user.assessmentsTaken.map(assessment => ({
        id: assessment._id,
        technology: assessment.technology,
        level: assessment.level,
        score: assessment.score,
        createdAt: assessment.createdAt
      }))
    };

    res.json({ user, userActivity });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateUserDetails = async (req, res) => {
  const { name, phoneNumber, dateOfBirth, gender, education, occupation, profilePicture } = req.body;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (education) user.education = education;
    if (occupation) user.occupation = occupation;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    res.json({ msg: 'User details updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('lastLogin assessmentsTaken');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const assessments = await Assessment.find({ _id: { $in: user.assessmentsTaken } })
      .select('technology level score createdAt result');

    const userActivity = {
      lastLogin: user.lastLogin,
      assessments: assessments.map(assessment => ({
        id: assessment._id,
        technology: assessment.technology,
        level: assessment.level,
        score: assessment.score,
        createdAt: assessment.createdAt,
        result: assessment.result
      }))
    };

    res.json(userActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAssessmentResult = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const assessment = await Assessment.findById(assessmentId);
    
    if (!assessment) {
      return res.status(404).json({ msg: 'Assessment not found' });
    }

    if (assessment.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view this assessment' });
    }

    res.json(assessment.result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
