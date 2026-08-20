// backend/src/routes/coverLetter.js
const express = require('express');
const router = express.Router();
const { generateCoverLetter } = require('../services/geminiService');

// Generate cover letter endpoint
router.post('/generate', async (req, res) => {
  try {
    // Destructure with correct field names from frontend
    const { company, position, tone, resume, jobDescription } = req.body;

    // Validate required fields
    if (!company || !position) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: company and position are required'
      });
    }

    // Generate the cover letter
    const result = await generateCoverLetter({
      company: company.trim(),
      position: position.trim(),
      tone: tone || 'professional',
      resume: resume?.trim(),
      jobDescription: jobDescription?.trim()
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cover letter'
    });
  }
});

module.exports = router;