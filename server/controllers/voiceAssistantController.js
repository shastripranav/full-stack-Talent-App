const { getGroqResponse } = require('../utils/groq');
const { textToSpeech } = require('../utils/deepgram');
const { transcribeAudio } = require('../utils/transcription');
const VoiceChat = require('../models/VoiceChat');

// New function for initial greeting
exports.getInitialGreeting = async (req, res) => {
  try {
    // Get introduction message from Groq
    const introText = await getGroqResponse("", true);
    console.log("Intro Text:", introText);
    
    // Convert introduction to speech
    const audioData = await textToSpeech(introText);

    // Save the interaction with proper user ID and non-empty userInput
    await saveInteraction(req.user.id, "Initial greeting", introText, true);

    // Send both text and audio to client
    res.json({
      text: introText,
      audio: audioData,
      isIntroduction: true
    });
  } catch (error) {
    console.error('Error generating initial greeting:', error);
    res.status(500).json({ error: 'Failed to generate initial greeting' });
  }
};

// Modified process input function
exports.processInput = async (req, res) => {
  try {
    let userText;
    
    if (!req.body.audio) {
      return res.status(400).json({ error: 'Audio input is required' });
    }

    // 1. Transcribe user's audio to text
    const audioBuffer = Buffer.from(req.body.audio, 'base64');
    userText = await transcribeAudio(audioBuffer);
    
    if (!userText) {
      return res.status(400).json({ error: 'Failed to transcribe audio input' });
    }

    // 2. Get bot's response using Groq
    const botResponse = await getGroqResponse(userText, false);

    // 3. Convert bot's response to speech
    const audioData = await textToSpeech(botResponse);

    // 4. Save the interaction with proper user ID
    await saveInteraction(req.user.id, userText, botResponse, false);

    // Send complete response back to client
    res.json({
      userText: userText,
      botText: botResponse,
      audio: audioData,
      isIntroduction: false
    });
  } catch (error) {
    console.error('Error processing voice assistant input:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

// Helper function to save interactions
async function saveInteraction(userId, userInput, botResponse, isIntroduction) {
  try {
    if (!userId) {
      console.error('No userId provided to saveInteraction');
      return;
    }

    // Ensure userInput is never empty
    const sanitizedUserInput = userInput || "User initiated conversation";
    
    // Find existing chat history for user or create new one
    let voiceChat = await VoiceChat.findOne({ userId });
    
    if (!voiceChat) {
      voiceChat = new VoiceChat({ 
        userId, 
        interactions: [] 
      });
    }

    // Add new interaction with sanitized input
    voiceChat.interactions.push({
      userInput: sanitizedUserInput,
      botResponse,
      isIntroduction,
      timestamp: new Date()
    });

    await voiceChat.save();
  } catch (error) {
    console.error('Error saving voice chat interaction:', error);
    // Log more details about the error
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
  }
}
