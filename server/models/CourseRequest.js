const mongoose = require('mongoose');

const courseRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  technologyStack: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  trainingLevel: {
    type: String,
    required: true,
    enum: ['Beginner', 'Mid Management', 'C-Suite']
  },
  generatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GeneratedCourse',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CourseRequest', courseRequestSchema);
