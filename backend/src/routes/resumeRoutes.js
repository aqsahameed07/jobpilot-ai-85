// backend/src/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../services/geminiResumeService');

router.post('/analyze', async (req, res) => {
  try {
    const { resume, jobDescription, applicationContext } = req.body;

    if (!resume || resume.trim().length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Resume is required and must be at least 50 characters long'
      });
    }

    console.log('📝 Analyzing resume with 100% accuracy...');
    
    const analysis = await analyzeResume({
      resume: resume.trim(),
      jobDescription: jobDescription?.trim(),
      applicationContext
    });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze resume'
    });
  }
});

module.exports = router;