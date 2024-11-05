require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
const voiceAssistantRoutes = require('./routes/voiceAssistant');
const courseRoutes = require('./routes/course');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Check and create necessary collections
const checkAndCreateCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      await mongoose.connection.createCollection('users');
      console.log('Users collection created');
    }

    if (!collectionNames.includes('assessments')) {
      await mongoose.connection.createCollection('assessments');
      console.log('Assessments collection created');
    }

    if (!collectionNames.includes('voicechats')) {
      await mongoose.connection.createCollection('voicechats');
      console.log('Voice Chats collection created');
    }

    if (!collectionNames.includes('courserequests')) {
      await mongoose.connection.createCollection('courserequests');
      console.log('Course Requests collection created');
    }

    if (!collectionNames.includes('generatedcourses')) {
      await mongoose.connection.createCollection('generatedcourses');
      console.log('Generated Courses collection created');
    }

    if (!collectionNames.includes('resumeanalyses')) {
      await mongoose.connection.createCollection('resumeanalyses');
      console.log('Resume Analyses collection created');
    }

    console.log('All necessary collections are present');
  } catch (error) {
    console.error('Error checking/creating collections:', error);
  }
};

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
});

// Middleware
app.use(cors());

// Increase payload size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/voiceassistant', voiceAssistantRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/resume', resumeRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handler Middleware
app.use(errorHandler);

// Debug middleware
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Registered Routes:', app._router.stack.filter(r => r.route).map(r => r.route.path));
  next();
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  checkAndCreateCollections();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
