const { getGroqResponse } = require('../utils/groq');
const { textToSpeech } = require('../utils/deepgram');

exports.processInput = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Get response from Groq
    const botResponse = await getGroqResponse(text);

    // Convert bot response to speech
    const audioData = await textToSpeech(botResponse);

    // Send response back to client
    res.json({
      text: botResponse,
      audio: audioData
    });
  } catch (error) {
    console.error('Error processing voice assistant input:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
};
