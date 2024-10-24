const Groq = require("groq-sdk");

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.transcribeAudio = async (audioBuffer) => {
  try {
    // Create a File object from the audioBuffer
    const file = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

    // Create a transcription job
    const transcriptions = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      prompt: "Transcribe the following audio",
      response_format: "json",
      temperature: 0.0,
    });

    // Return the transcribed text
    return transcriptions.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
};
