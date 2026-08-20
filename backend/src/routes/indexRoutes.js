// backend/src/routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const applicationRoutes = require('./applicationRoutes');
const coverLetterRoutes = require('./coverLetter');
const resumeRoutes = require('./resumeRoutes'); // ✅ Import resume routes

// Import all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/applications', applicationRoutes);
router.use('/cover-letter', coverLetterRoutes);
router.use('/resume', resumeRoutes); // ✅ Add resume routes

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'JobPilot API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      applications: '/api/applications',
      coverLetter: '/api/cover-letter/generate',
      resume: '/api/resume/analyze',
      health: '/api/health'
    }
  });
});

module.exports = router;