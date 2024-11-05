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
  id, text, options (array of 4 choices, make sure  not to add option no while giving the options, just the option text), correctAnswer(Choice in the Number form between 1-4), difficulty (easy, medium, hard), bloomsCategory, and competency.`;

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
    - Duration: ${duration} ( this might be in weeks or days. If it is in weeks, you can cover all 5 days of those weeks & spread the topics accordingly. But if the request is in days then be explicit about the number of days. For example if the request is of 7 days, then Generate outline for 5 days in week 1 & then remaining 2 days in week 2)
    - Training Level: ${trainingLevel} (Beginner, Mid Management, or C-Suite)

    Tailor the content and complexity based on the training level:
    - For Beginner: Focus on foundational concepts and hands-on skills.
    - For Mid Management: Include both technical and managerial aspects, with emphasis on project management and team leadership.
    - For C-Suite: Concentrate on high-level strategic implications, business impact, and decision-making related to the technology.

    The course outline should include:
    - Course Title
    - Course Overview
    - Learning Objectives (as an array)
    - Technologies Covered (as an array)
    - Weekly breakdown (for each week & assuming 5 days in a week):
      - Daily topics (enough granular topics to cover 4 hrs each day)
      - Daily activities (for 1-2 hrs each day)
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
      Make sure to give only the json object and nothing else.

      Ensure that:
    1. The course content builds progressively over the duration.
    2. Each day includes at least 5 detailed topics, 3 specific learning objectives, and 2 hands-on activities.
    3. The content is tailored to the ${trainingLevel} level.
    4. The course aligns closely with the provided job description and the ${technologyStack} focus.
    5. The structure is detailed, modular, and follows the exact format provided above.
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
    console.log('Course outline generated'+response.data.choices[0].message.content);
    const content = response.data.choices[0].message.content;
    const cleanedResponseText = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedResponseText);
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    throw error;
  }
};

exports.analyzeResumeWithGPT = async (resumeText) => {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set. Please check your .env file.');
    throw new Error('OpenAI API key is not set');
  }
  const prompt = `
        Analyze the following resume and provide a detailed analysis in the following structured format. Be specific and detailed in your analysis:

        1. Provide candidate name & a concise professional summary (4-5 sentences)
        2. Extract and categorize skills into:
           - Technical Skills
           - Non-Technical Skills
           - Certifications
        3. Detail work experience including company, position, duration, key responsibilities, and achievements
        4. List educational background with degrees, institutions, years, and any academic achievements
        5. Identify and describe key projects with:
           - Project name
           - Detailed description
           - Technologies used
           - Key highlights
        6. List key professional strengths (minimum 5)
        7. Assess overall competencies:
           - Technical competencies with proficiency levels (Expert/Intermediate/Beginner)
           - Non-technical competencies with proficiency levels
        8. Top 4 tech skills
        9. Calculate match scores (0-100):
           - Skills alignment score
           - Project alignment score
           - Overall match score
        10. Suggest 3 future roles with:
           - Role title
           - Reason for suggestion
           - Required skills
           - Current skill gaps

        Resume Text:
        ${resumeText}
        
        Provide the analysis in an exact structured JSON format matching the following schema:
        {
            "summary":{
                "candidateName" : "string",
                "professionalSummary" : "string"
                  },
            "skills": {
                "technical": ["skill1", "skill2"],
                "nonTechnical": ["skill1", "skill2"],
                "certifications": ["cert1", "cert2"]
            },
            "workExperience": [{
                "company": "string",
                "position": "string",
                "duration": "string",
                "responsibilities": ["resp1", "resp2"],
                "achievements": ["achievement1", "achievement2"]
            }],
            "education": [{
                "degree": "string",
                "field": "string",
                "institution": "string",
                "year": number,
                "achievements": ["achievement1", "achievement2"]
            }],
            "projects": [{
                "name": "string",
                "description": "string",
                "technologies": ["tech1", "tech2"],
                "highlights": ["highlight1", "highlight2"]
            }],
            "strengths": ["strength1", "strength2"],
            "overallCompetencies": {
                "technical": [{"skill": "string", "proficiencyLevel": "string"}],
                "nonTechnical": [{"skill": "string", "proficiencyLevel": "string"}]
            },
            "top4Skills" {
            [{"skill1" :"string","proficiencyLevel": "string"}]
            }
            "matchScore": {
                "skillsAlignment": number,
                "projectAlignment": number,
                "overallScore": number
            },
            "futureRoleSuggestions": [{
                "role": "string",
                "reason": "string",
                "requiredSkills": ["skill1", "skill2"],
                "skillGaps": ["gap1", "gap2"]
            }]
        }`;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const content = response.data.choices[0].message.content;
    const cleanedResponseText = content.replace(/```json|```/g, '').trim();
    console.log(cleanedResponseText);
    // Parse the response to ensure it's valid JSON
    const analysis = JSON.parse(cleanedResponseText);

    // Validate the required fields
    const requiredFields = ['summary', 'skills', 'workExperience', 
                          'education', 'projects','strengths', 'overallCompetencies', 'matchScore','futureRoleSuggestions'];
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return analysis;

  } catch (error) {
    console.error('Error in resume analysis:', error.response ? error.response.data : error.message);
    throw new Error('Failed to analyze resume with GPT');
  }
};

// Export all functions
module.exports = {
  generateAssessmentQuestions: exports.generateAssessmentQuestions,
  generateCourseOutline: exports.generateCourseOutline,
  analyzeResumeWithGPT: exports.analyzeResumeWithGPT
};
