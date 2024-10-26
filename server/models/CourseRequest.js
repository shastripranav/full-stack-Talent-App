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
    type: Number,
    required: true
  },
  trainingLevel: {
    type: String,
    required: true
  },
  generatedCourse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CourseRequest', courseRequestSchema);
