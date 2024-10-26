const { generateCourseOutline } = require('../utils/chatgpt');
const CourseRequest = require('../models/CourseRequest');
const GeneratedCourse = require('../models/GeneratedCourse');

exports.createCourse = async (req, res) => {
  // Implementation for creating a course
};

exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await GeneratedCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    res.status(500).json({ error: 'An error occurred while retrieving the course' });
  }
};

exports.generateCourseOutline = async (req, res) => {
  try {
    const { jobDescription, technologyStack, duration, trainingLevel } = req.body;

    // Validate inputs
    if (!jobDescription || !technologyStack || !duration || !trainingLevel) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Log the course request
    const courseRequest = new CourseRequest({
      userId: req.user.id,
      jobDescription,
      technologyStack,
      duration,
      trainingLevel
    });
    await courseRequest.save();

    // Generate course outline using ChatGPT
    const courseOutline = await generateCourseOutline(jobDescription, technologyStack, duration, trainingLevel);

    // Save the generated course
    const generatedCourse = new GeneratedCourse({
      courseRequestId: courseRequest._id,
      userId: req.user.id,
      ...courseOutline
    });
    await generatedCourse.save();

    // Update the course request with the generated course ID
    courseRequest.generatedCourse = generatedCourse._id;
    await courseRequest.save();

    // Send the course outline to the client
    res.json(generatedCourse);
  } catch (error) {
    console.error('Error generating course outline:', error);
    res.status(500).json({ error: 'An error occurred while generating the course outline' });
  }
};
