
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Controllers
const categoryController = require('./controller/category');
app.use('/category', categoryController);
const zapisekController = require('./controller/zapisek');
app.use('/zapisek', zapisekController);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});