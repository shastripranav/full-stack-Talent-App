const mongoose = require('mongoose');

const voiceChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interactions: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userInput: {
      type: String,
      required: true
    },
    botResponse: {
      type: String,
      required: true
    },
    isIntroduction: {
      type: Boolean,
      default: false
    }
  }]
});

module.exports = mongoose.model('VoiceChat', voiceChatSchema);
