const { createAssessment, submitAssessment } = require('./controllers/assessmentController');
const Assessment = require('./models/Assessment');
const { generateAssessmentQuestions } = require('../utils/chatgpt');

jest.mock('../models/Assessment');
jest.mock('../utils/chatgpt');

describe('Assessment Controller', () => {
  test('createAssessment creates a new assessment', async () => {
    const req = {
      body: {
        name: 'John Doe',
        age: 25,
        location: 'New York',
        education: 'Bachelor',
        language: 'English',
        technology: 'JavaScript',
        level: 'Intermediate'
      },
      user: { id: 'user123' }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    generateAssessmentQuestions.mockResolvedValue([/* mock questions */]);
    Assessment.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ _id: 'assessment123' })
    }));

    await createAssessment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Assessment created successfully',
      assessmentId: 'assessment123'
    }));
  });

  // Add more tests for submitAssessment and error cases
});
