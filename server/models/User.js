const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const shortid = require('shortid'); // You'll need to install this package: npm install shortid

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

function generateFixedLengthId() {
    return shortid.generate().slice(0, 8); // generates an 8-character ID
}
const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: generateFixedLengthId
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  education: {
    type: String,
    enum: ['high-school', 'bachelors', 'masters', 'phd', 'other'],
    required: true
  },
  occupation: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  assessmentsTaken: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  profilePicture: {
    type: String,
    default: null
  },
  lastAssessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
