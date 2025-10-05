// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinator: {
    type: String,
    required: true
  },
  registrations: {
    type: Number,
    required: true,
    min: 0
  },
  checkIns: {
    type: Number,
    required: true,
    min: 0
  },
  feedbackScore: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  validateBeforeSave: false
});

module.exports = mongoose.model('Report', reportSchema);
