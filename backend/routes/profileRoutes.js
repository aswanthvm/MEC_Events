const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RegisteredEvent = require('../models/RegisteredEvent');

// Get user details by email
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's event statistics
router.get('/:email/stats', async (req, res) => {
  try {
    const registeredEvents = await RegisteredEvent.find({ email: req.params.email });
    const now = new Date();
    
    const stats = {
      eventsRegistered: registeredEvents.length,
      eventsAttended: registeredEvents.filter(event => new Date(event.date) < now).length,
      upcomingEvents: registeredEvents.filter(event => new Date(event.date) >= now).length
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's signup details
router.get('/:email/signup-details', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      studentId: user.studentId,
      department: user.department
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;