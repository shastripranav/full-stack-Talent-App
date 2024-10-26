const axios = require('axios');
const technologyCompetencies = require('./competencies');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.generateAssessmentQuestions = async (technology, level) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set. Please check your .env file.');
    throw new Error('OpenAI API key is not set');
  }

  const competencies = technologyCompetencies[technology] || [
    'General Knowledge',
    'Problem Solving',
    'Coding Skills',
    'System Design',
    'Best Practices',
    'Tool Proficiency'
  ];

  const prompt = `Generate 25 multiple-choice questions for a ${level} level ${technology} interview. Focus on the core technology. 
  The questions should be appropriate for a ${level} (Beginner, Mid-level, or Senior Executive) and be divided into Bloom's Taxonomy categories: 
  Remember, Understand, Apply, Analyze, and Create. Make sure all the questions have 4 options. Include relevant coding & debugging questions.
  If the question is related to coding then have 4 sample codes given in the options to select from, make sure one of the options is correct and the question doesn't have the listed options.

  Make the questions scenario-based rather than having direct answers, use explicitly any one of the Blooms taxonomy like Remember, Understand, Apply, Analyze, Create, Evaluate. There should be atleast on question in each of the Bloom's taxonomy.

  For each question, assign one of the following competencies:
  ${competencies.join(', ')}

  Format the response as a JSON array of objects, each containing: 
  id, text, options (array of 4 choices), correctAnswer(Choice in the Number form between 1-4), difficulty (easy, medium, hard), bloomsCategory, and competency.`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']') + 1;
    const jsonString = content.slice(jsonStart, jsonEnd);
    const questions = JSON.parse(jsonString);
    console.log(questions);
    return questions;    
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    throw error;
  }
};

exports.generateCourseOutline = async (jobDescription, technologyStack, duration, trainingLevel) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set. Please check your .env file.');
    throw new Error('OpenAI API key is not set');
  }

  const prompt = `
    Generate a detailed training course outline based on the following information:
    - Job Description: ${jobDescription}
    - Technology Stack: ${technologyStack}
    - Duration: ${duration} weeks
    - Training Level: ${trainingLevel}

    The course outline should include:
    - Course Title
    - Course Overview
    - Learning Objectives (as an array)
    - Technologies Covered (as an array)
    - Weekly breakdown (for each week):
      - Daily topics (for 5 days each week)
      - Daily activities (for each day)
      - Daily learning outcomes (for each day)

    The training occurs 5 days a week, 4 hours each day.
    Format the response as a JSON object with the following structure:
    {
      "courseTitle": "string",
      "courseOverview": "string",
      "learningObjectives": ["string"],
      "technologiesCovered": ["string"],
      "weeklyBreakdown": [
        {
          "week": number,
          "dailyTopics": [
            {
              "day": number,
              "topics": ["string"],
              "activities": ["string"],
              "learningOutcomes": ["string"]
            }
          ]
        }
      ]
    }
  `;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    throw error;
  }
};
