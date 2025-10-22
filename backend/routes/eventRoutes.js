// backend/routes/eventRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Event = require('../models/Event');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Clean filename and add timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow common image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// GET a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching event' });
  }
});

// GET count of active events
router.get('/count/active', async (req, res) => {
  try {
    const count = await Event.countDocuments({ date: { $gte: new Date() } });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Error counting active events' });
  }
});

// GET count of events this month
router.get('/count/monthly', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const count = await Event.countDocuments({
      date: { 
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Error counting monthly events' });
  }
});

// Test endpoint to check upload functionality
router.get('/test-upload', (req, res) => {
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  res.json({
    message: 'Upload endpoint is working',
    uploadsPath: uploadsPath,
    uploadsExists: fs.existsSync(uploadsPath),
    uploadedFiles: fs.existsSync(uploadsPath) ? fs.readdirSync(uploadsPath) : []
  });
});

// POST upload image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File info:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    console.log('Generated image URL:', imageUrl);
    
    res.status(200).json({ 
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading file: ' + error.message });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message === 'Only image files (JPG, PNG, GIF, WebP) are allowed!') {
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Multer error:', error);
  res.status(500).json({ error: 'File upload error: ' + error.message });
});

// POST a new event
router.post('/', async (req, res) => {
  const { title, date, description, image, prize} = req.body;
  const newEvent = new Event({ title, date,prize ,description, image});

  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

// PUT (update) an existing event
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

// DELETE an event
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

module.exports = router;
