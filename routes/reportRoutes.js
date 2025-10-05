const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const mongoose = require('mongoose');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Reports API is working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to create a minimal report
router.post('/test', async (req, res) => {
  try {
    const testReportData = {
      eventName: 'Test Event',
      date: '2025-10-01',
      location: 'Test Location',
      coordinator: 'Test Coordinator',
      registrations: 10,
      checkIns: 8,
      feedbackScore: 4.5
    };
    
    console.log('Creating test report with minimal data:', testReportData);
    const testReport = new Report(testReportData);
    const savedReport = await testReport.save();
    
    res.json({
      message: 'Test report created successfully',
      report: savedReport
    });
  } catch (error) {
    console.error('Test report creation failed:', error);
    res.status(400).json({
      message: 'Test report creation failed',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// BYPASS route - creates report directly in MongoDB without mongoose validation
router.post('/create-direct', async (req, res) => {
  try {
    console.log('Direct creation - bypassing all Mongoose validation');
    console.log('Request body:', req.body);
    
    const { eventName, date, location, coordinator, registrations, checkIns, feedbackScore } = req.body;
    
    if (!eventName || !date || !location || !coordinator) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }
    
    // Insert directly into MongoDB, bypassing Mongoose completely
    const db = mongoose.connection.db;
    const collection = db.collection('reports');
    
    const reportDoc = {
      eventName: eventName.toString().trim(),
      date: date.toString().trim(),
      location: location.toString().trim(),
      coordinator: coordinator.toString().trim(),
      registrations: parseInt(registrations) || 0,
      checkIns: parseInt(checkIns) || 0,
      feedbackScore: parseFloat(feedbackScore) || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Inserting document directly:', reportDoc);
    const result = await collection.insertOne(reportDoc);
    console.log('Direct insert successful:', result.insertedId);
    
    // Fetch the created document
    const createdDoc = await collection.findOne({ _id: result.insertedId });
    
    res.status(201).json({
      success: true,
      message: 'Report created successfully via direct MongoDB insertion',
      report: createdDoc,
      bypassedValidation: true
    });
    
  } catch (error) {
    console.error('Direct creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Direct creation failed',
      error: error.message
    });
  }
});

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// POST create new report
router.post('/', async (req, res) => {
  try {
    const { eventName, date, location, coordinator, registrations, checkIns, feedbackScore } = req.body;

    // Validation
    if (!eventName || !date || !location || !coordinator || 
        registrations === undefined || checkIns === undefined || feedbackScore === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (checkIns > registrations) {
      return res.status(400).json({ error: 'Check-ins cannot exceed registrations' });
    }

    if (feedbackScore < 0 || feedbackScore > 5) {
      return res.status(400).json({ error: 'Feedback score must be between 0 and 5' });
    }

    const reportData = {
      eventName: eventName.trim(),
      date: date.trim(),
      location: location.trim(),
      coordinator: coordinator.trim(),
      registrations: parseInt(registrations),
      checkIns: parseInt(checkIns),
      feedbackScore: parseFloat(feedbackScore)
    };

    const report = new Report(reportData);
    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update report
router.put('/:id', async (req, res) => {
  try {
    const { eventName, date, location, coordinator, registrations, checkIns, feedbackScore } = req.body;

    if (checkIns > registrations) {
      return res.status(400).json({ error: 'Check-ins cannot exceed registrations' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { eventName, date, location, coordinator, registrations, checkIns, feedbackScore },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE report
router.delete('/:id', async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);
    if (!deletedReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset collection (remove all console.log statements)
router.post('/reset-collection', async (req, res) => {
  try {
    await mongoose.connection.db.dropCollection('reports');
    const Report = require('../models/Report');
    await Report.createIndexes();
    res.json({ message: 'Collection reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
