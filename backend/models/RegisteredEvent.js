// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  eventID: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
});

module.exports = mongoose.model('Booking', bookingSchema);
