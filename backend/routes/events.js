// backend/routes/events.js
const express = require('express');
const Event = require('../models/Event'); // Import the Event model
const router = express.Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new event
router.post('/', async (req, res) => {
  const event = new Event({
    title: req.body.title,
    date: req.body.date,
    prize: req.body.prize,
    description: req.body.description,
    image: req.body.image,
    category: req.body.category
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
