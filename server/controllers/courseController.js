const { generateCourseOutline } = require('../utils/chatgpt');
const CourseRequest = require('../models/CourseRequest');
const GeneratedCourse = require('../models/GeneratedCourse');
const User = require('../models/User');


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
    console.log('Received generateCourseOutline request:', req.body);

    // Validate inputs
    if (!jobDescription || !technologyStack || !duration || !trainingLevel) {
      return res.status(409).json({ error: 'All fields are required' });
    }

    // Validate trainingLevel
    const validLevels = ['Beginner', 'Mid Management', 'C-Suite'];
    if (!validLevels.includes(trainingLevel)) {
      return res.status(402).json({ error: 'Invalid training level. Must be Beginner, Mid Management, or C-Suite' });
    }

    // Create and save the course request first
    const courseRequest = new CourseRequest({
      userId: req.user.id,
      jobDescription,
      technologyStack,
      duration,
      trainingLevel
    });
    await courseRequest.save();
    console.log('Course request saved:', courseRequest);

    // Generate course outline using ChatGPT
    const courseOutline = await generateCourseOutline(jobDescription, technologyStack, duration, trainingLevel);
    console.log('Course outline generated:', courseOutline);

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

    console.log('Course outline generated successfully');
    console.log(generatedCourse);

    // Send the course outline to the client
    res.json(generatedCourse);
  } catch (error) {
    console.error('Error generating course outline:', error);
    res.status(500).json({ error: 'An error occurred while generating the course outline' });
  }
};
