require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing middleware with increased limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length) {
    console.log('Request body:', req.body);
  }
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Route handlers
const bookingRoutes = require('./routes/bookings');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Register core routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Report routes (if available)
try {
  const reportRoutes = require('./routes/reportRoutes');
  app.use('/api/reports', reportRoutes);
} catch (error) {
  console.log('Report routes not loaded:', error.message);
}



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle payload too large error
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'The request payload is too large. For images, please use the file upload feature instead of embedding large images.',
      limit: err.limit,
      received: err.length
    });
  }
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: ['/api/bookings', '/api/events', '/api/reports', '/api/users']
  });
});

// MongoDB connection with error handling
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-events')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if database connection fails
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
