const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { generateAssessmentQuestions } = require('../utils/chatgpt');
const technologyCompetencies = require('../utils/competencies');

exports.createAssessment = async (req, res) => {
    try {
        const { technology, level } = req.body;
        const userId = req.user.userId; // Make sure this is the string userId, not the ObjectId

        const questions = await generateAssessmentQuestions(technology, level);

        const assessment = new Assessment({
            userId,
            technology,
            level,
            questions
        });

        await assessment.save();

        // Add assessment to user's assessmentsTaken
        await User.findOneAndUpdate(
            { userId: userId },
            { $push: { assessmentsTaken: assessment._id } }
        );

        res.status(201).json({ 
            message: 'Assessment created successfully', 
            assessmentId: assessment._id,
            questions: assessment.questions
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        res.status(500).json({ message: 'Error creating assessment' });
    }
};

exports.submitAssessment = async (req, res) => {
    try {
        const { assessmentId, userAnswers } = req.body;

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Check if the assessment has already been submitted
        if (assessment.submitted) {
            return res.status(400).json({ message: 'Assessment has already been submitted' });
        }

        // Check if the submission is within the time limit
        const submissionTime = new Date();
        const assessmentStartTime = assessment.createdAt;
        const timeDifference = submissionTime - assessmentStartTime;
        const timeLimit = 30 * 60 * 1000; // 30 minutes in milliseconds

        if (timeDifference > timeLimit) {
            return res.status(400).json({ message: 'Assessment time limit exceeded' });
        }

        // Convert userAnswers to an array format
        const formattedUserAnswers = Object.values(userAnswers).map(answer => answer - 1); // Subtract 1 to convert to 0-based index

        let score = 0;
        const bloomCategories = {};
        const competencies = technologyCompetencies[assessment.technology] || [];
        const competencyScores = {};

        // Initialize competencyScores
        competencies.forEach(competency => {
            competencyScores[competency] = { correct: 0, total: 0 };
        });

        console.log("Formatted User Answers:", formattedUserAnswers);
        console.log("Number of questions:", assessment.questions.length);

        assessment.questions.forEach((question, index) => {
            console.log(`Question ${index + 1}:`);
            console.log("Competency:", question.competency);
            console.log("Correct Answer:", question.correctAnswer);
            console.log("User Answer:", formattedUserAnswers[index]);

            if (!question.competency) {
                console.warn(`Missing competency for question: ${question.id}`);
                return; // Skip this question
            }

            if (!competencyScores[question.competency]) {
                console.warn(`Invalid competency for question: ${question.id}. Competency: ${question.competency}`);
                return; // Skip this question
            }

            competencyScores[question.competency].total++;

            if (formattedUserAnswers[index] === question.correctAnswer) {
                score++;
                competencyScores[question.competency].correct++;
            }

            if (question.bloomsCategory) {
                bloomCategories[question.bloomsCategory] = (bloomCategories[question.bloomsCategory] || 0) + 1;
            }
        });

        console.log("Final Score:", score);
        console.log("Competency Scores:", competencyScores);

        const percentageScore = (score / assessment.questions.length) * 100;

        const barChartData = Object.entries(bloomCategories).map(([category, total]) => ({
            category,
            correct: assessment.questions.filter((q, i) => q.bloomsCategory === category && formattedUserAnswers[i] === q.correctAnswer).length,
            total
        }));

        const spiderChartData = Object.entries(competencyScores).map(([competency, { correct, total }]) => ({
            competency,
            score: total > 0 ? (correct / total) : 0
        }));

        assessment.userAnswers = formattedUserAnswers;
        assessment.score = score;
        assessment.result = {
            barChartData,
            spiderChartData,
            selected: percentageScore >= 80
        };
        assessment.submitted = true; // Mark the assessment as submitted

        await assessment.save();

        // Update user's lastAssessment
        await User.findOneAndUpdate({ userId: assessment.userId }, { lastAssessment: assessment._id });

        // Include the score in the response
        res.json({
            score: score,
            totalQuestions: assessment.questions.length,
            percentageScore: percentageScore,
            result: assessment.result
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        res.status(500).json({ message: 'Error submitting assessment' });
    }
};

exports.getAssessmentResult = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (!assessment.submitted) {
      return res.status(400).json({ message: 'Assessment has not been submitted yet' });
    }

    res.json({
      score: assessment.score,
      totalQuestions: assessment.questions.length,
      percentageScore: (assessment.score / assessment.questions.length) * 100,
      result: assessment.result
    });
  } catch (error) {
    console.error('Error retrieving assessment result:', error);
    res.status(500).json({ message: 'Error retrieving assessment result' });
  }
};
