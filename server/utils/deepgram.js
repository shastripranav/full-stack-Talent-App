// Deepgram API integration

const { Deepgram } = require('@deepgram/sdk');

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

exports.textToSpeech = async (text) => {
  try {
    const response = await deepgram.transcription.preRecorded(
      {
        buffer: Buffer.from(text),
        mimetype: 'text/plain',
      },
      {
        smart_format: true,
        model: 'general',
        language: 'en-US',
        tier: 'enhanced',
      }
    );

    // Note: This is a placeholder. Deepgram doesn't currently offer TTS.
    // You'll need to replace this with actual TTS API call when available.
    const audioData = 'base64_encoded_audio_data';

    return audioData;
  } catch (error) {
    console.error('Error calling Deepgram API:', error);
    throw new Error('Failed to convert text to speech');
  }
};
