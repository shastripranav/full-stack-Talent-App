const { getGroqResponse } = require('../utils/groq');
const { textToSpeech } = require('../utils/deepgram');
const { transcribeAudio } = require('../utils/transcription');
const VoiceChat = require('../models/VoiceChat');

// In-memory store to track greeting state
const userGreetingState = {};

// New function for initial greeting
exports.getInitialGreeting = async (req, res) => {
  const userId = req.user.id;

  // Check if the greeting has already been sent
  if (userGreetingState[userId]) {
    return res.status(200).json({ message: 'Greeting already sent' });
  }

  try {
    // Get introduction message from Groq
    const introText = await getGroqResponse("", true);
    console.log("Intro Text:", introText);
    
    // Convert introduction to speech
    const audioData = await textToSpeech(introText);

    // Save the interaction with proper user ID and non-empty userInput
    await saveInteraction(userId, "Initial greeting", introText, true);

    // Mark the greeting as sent for this user
    userGreetingState[userId] = true;

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
  let responseAlreadySent = false;
  
  try {
    console.log('Request body type:', typeof req.body);
    console.log('Is buffer:', Buffer.isBuffer(req.body));
    
    if (!req.body || !Buffer.isBuffer(req.body)) {
      responseAlreadySent = true;
      return res.status(400).json({ error: 'Audio input is required as raw buffer' });
    }

    // 1. Transcribe user's audio to text
    const userText = await transcribeAudio(req.body);
    
    if (!userText) {
      responseAlreadySent = true;
      return res.status(400).json({ error: 'Failed to transcribe audio input' });
    }

    // 2. Get bot's response using Groq
    const botResponse = await getGroqResponse(userText, false);

    // 3. Convert bot's response to speech
    const audioData = await textToSpeech(botResponse);

    // 4. Save the interaction with proper user ID
    await saveInteraction(req.user.id, userText, botResponse, false);

    // Check if response was already sent
    if (!responseAlreadySent) {
      responseAlreadySent = true;
      // Send complete response back to client
      res.json({
        userText: userText,
        botText: botResponse,
        audio: audioData,
        isIntroduction: false
      });
    }
  } catch (error) {
    if (!responseAlreadySent) {
      responseAlreadySent = true;
      console.error('Error processing voice assistant input:', error);
      res.status(500).json({ error: 'An error occurred while processing your request' });
    }
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
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
  }
}

// New function to process text input
exports.processTextInput = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Get bot's response using Groq
    const botResponse = await getGroqResponse(text, false);

    // Convert bot's response to speech
    const audioData = await textToSpeech(botResponse);

    // Save the interaction with proper user ID
    await saveInteraction(req.user.id, text, botResponse, false);

    // Send complete response back to client
    res.json({
      botText: botResponse,
      audio: audioData,
      isIntroduction: false
    });
  } catch (error) {
    console.error('Error processing text input:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};

// New function to get today's chat history
exports.getTodaysChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const voiceChat = await VoiceChat.findOne({ userId });

    if (!voiceChat) {
      return res.status(404).json({ error: 'No chat history found for today' });
    }

    const todaysInteractions = voiceChat.interactions.filter(interaction => {
      return interaction.timestamp >= startOfDay;
    });

    res.json(todaysInteractions);
  } catch (error) {
    console.error('Error fetching today\'s chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
