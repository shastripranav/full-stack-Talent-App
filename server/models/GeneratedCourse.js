const mongoose = require('mongoose');

const generatedCourseSchema = new mongoose.Schema({
  courseRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseRequest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  courseOverview: {
    type: String,
    required: true
  },
  learningObjectives: [String],
  technologiesCovered: [String],
  weeklyBreakdown: [{
    week: Number,
    dailyTopics: [{
      day: Number,
      topics: [String],
      activities: [String],
      learningOutcomes: [String]
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GeneratedCourse', generatedCourseSchema);
