const { Groq } = require('groq-sdk');
const fs = require('fs');
const FormData = require('form-data');

exports.transcribeAudio = async (filePath) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Check if file exists and is readable
    await fs.promises.access(filePath, fs.constants.R_OK);
    
    // Get file stats for logging
    const stats = await fs.promises.stat(filePath);
    console.log('Processing file:', {
      path: filePath,
      size: stats.size,
      isFile: stats.isFile()
    });

    // Create a ReadStream for the audio file
    const fileStream = fs.createReadStream(filePath);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('model', 'whisper-large-v3-turbo');

    // Make the transcription request
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo'
    });

    console.log('Transcription response:', response); // Debug log

    return response.text;

  } catch (error) {
    console.error('Transcription error details:', {
      message: error.message,
      status: error.status,
      error: error.error
    });
    throw new Error('Failed to transcribe audio');
  }
}
