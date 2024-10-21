require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const cors = require('cors');
const voiceAssistantRoutes = require('./routes/voiceassistant');

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

    console.log('All necessary collections are present');
  } catch (error) {
    console.error('Error checking/creating collections:', error);
  }
};

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/voiceassistant', voiceAssistantRoutes);
// ... other routes

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handler Middleware
app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  checkAndCreateCollections();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
