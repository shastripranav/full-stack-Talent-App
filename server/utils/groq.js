// Groq API integration

const axios = require('axios');

exports.getGroqResponse = async (userInput) => {
  try {
    const response = await axios.post('https://api.groq.com/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: userInput }],
      temperature: 0.7,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to get response from Groq');
  }
};
