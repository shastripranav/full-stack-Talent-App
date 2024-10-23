// Deepgram API integration

const { Deepgram } = require('@deepgram/sdk');
const fetch = require('node-fetch');

const DEEPGRAM_URL = "https://api.deepgram.com/v1/speak?model=aura-asteria-en";

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

exports.textToSpeech = async (text) => {
  try {
    const payload = JSON.stringify({ text });

    const response = await fetch(DEEPGRAM_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const audioBuffer = await response.buffer();
    return audioBuffer.toString('base64');
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to convert text to speech');
  }
};
