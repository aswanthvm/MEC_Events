const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  image: { type: String },
  prize: { type: String },
  category: { type: String } // Optional category for events
});

module.exports = mongoose.model('Event', eventSchema);
