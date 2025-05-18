const express = require('express');
const mongoose = require('mongoose');
const Ajv = require('ajv');
const addFormats = require('ajv-formats').default;
const { ObjectId } = require('mongodb');
const cors = require('cors');

console.log('Starting server initialization...');

// Configure Ajv globally with all necessary options
console.log('Configuring Ajv...');
const ajv = new Ajv({
  strict: false,
  allErrors: true,
  coerceTypes: true,
  allowUnionTypes: true,
  validateFormats: true,
  removeAdditional: true,
  useDefaults: true
});

// Add formats
console.log('Adding Ajv formats...');
addFormats(ajv);

// Add custom ObjectId validation as a format
console.log('Adding ObjectId format validation...');
ajv.addFormat('objectId', {
  type: 'string',
  validate: (data) => {
    try {
      return ObjectId.isValid(data);
    } catch (e) {
      return false;
    }
  }
});

// Make ajv available globally
global.ajv = ajv;
console.log('Ajv configuration complete');

const app = express();
console.log('Express app created');

// Configure CORS
console.log('Configuring CORS...');
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
console.log('Configuring middleware...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controllers
console.log('Loading controllers...');
try {
    const categoryController = require('./controller/category');
    app.use('/category', categoryController);
    console.log('Category controller loaded');

    const zapisekController = require('./controller/zapisek');
    app.use('/zapisek', zapisekController);
    console.log('Zapisek controller loaded');
} catch (error) {
    console.error('Error loading controllers:', error);
    process.exit(1);
}

// Error handling middleware (after routes)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      code: 'invalidJson',
      message: 'Invalid JSON payload',
      error: err.message
    });
  }
  res.status(500).json({
    code: 'internalError',
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
const port = process.env.PORT || 8000;
try {
    app.listen(port, () => {
        console.log('=================================');
        console.log(`🚀 Server running at http://localhost:${port}`);
        console.log(`Test the connection at http://localhost:${port}/zapisek/test-connection`);
        console.log('=================================');
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}