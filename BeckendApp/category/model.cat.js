const mongoose = require('mongoose');

//what will be in the category

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
},
 { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);