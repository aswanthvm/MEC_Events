const express = require('express');
const Booking = require('../models/Booking');
const fs = require('fs'); // File system module to create text files

const router = express.Router();

// Debug logging for all booking routes
router.use((req, res, next) => {
  console.log('[Bookings Route]', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// GET total number of bookings
router.get('/count/total', async (req, res) => {
  try {
    const count = await Booking.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error counting bookings' });
  }
});

// POST a new booking
router.post('/', async (req, res) => {
  try {
    console.log('Received booking request:', req.body);

    const { eventId, eventTitle, eventDate, name, studentId, department, phone, email } = req.body;
    
    // Validate required fields
    const requiredFields = { eventId, eventTitle, name, studentId, department, phone, email };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        details: `Please provide: ${missingFields.join(', ')}` 
      });
    }

    // Create a new booking
    const newBooking = new Booking({
      eventId,
      eventTitle,
      eventDate: new Date(eventDate),
      name,
      studentId,
      department,
      phone,
      email,
    });

    console.log('Attempting to save booking:', newBooking);

    // Check for existing booking
    const existingBooking = await Booking.findOne({
      eventId,
      studentId
    });

    if (existingBooking) {
      console.log('Duplicate booking found:', existingBooking);
      return res.status(400).json({
        message: 'Already registered',
        details: 'You have already registered for this event'
      });
    }

    // Save the booking
    const savedBooking = await newBooking.save();
    console.log('Booking saved successfully:', savedBooking);

    res.status(201).json({
      message: 'Registration successful',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Booking error:', error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        details: Object.values(error.errors).map(err => err.message) 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate registration', 
        details: 'You have already registered for this event' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating booking',
      details: error.message
    });
  }
});

// Generate text file for a specific event's bookings
router.get('/export/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const bookings = await Booking.find({ eventId });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this event' });
    }

    // Generate text content for the file in a table format
    let tableHeader = `| ${'Name'.padEnd(20)} | ${'Student ID'.padEnd(12)} | ${'Department'.padEnd(15)} | ${'Phone'.padEnd(15)} | ${'Email'.padEnd(30)} |\n`;
    let tableDivider = `|${'-'.repeat(22)}|${'-'.repeat(14)}|${'-'.repeat(17)}|${'-'.repeat(17)}|${'-'.repeat(32)}|\n`;
    let tableRows = bookings.map(booking => {
      return `| ${booking.name.padEnd(20)} | ${booking.studentId.padEnd(12)} | ${booking.department.padEnd(15)} | ${booking.phone.padEnd(15)} | ${booking.email.padEnd(30)} |\n`;
    }).join('');

    const fileContent = tableHeader + tableDivider + tableRows;
    
    const filePath = `./bookings_${eventId}.txt`;
    fs.writeFileSync(filePath, fileContent);

    // Send the file to the client
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating text file' });
  }
});

module.exports = router;
