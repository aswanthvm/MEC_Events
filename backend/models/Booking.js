// backend/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },  // Include eventDate
  name: { type: String, required: true },
  studentId: { type: String, required: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
