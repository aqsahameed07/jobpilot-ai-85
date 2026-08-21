// backend/src/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const { interviewTurn, scoreInterview } = require('../services/geminiInterviewService');

// Generate interview question
router.post('/turn', async (req, res) => {
  try {
    const { role, difficulty, messages } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    console.log(`📝 Generating interview question for ${role}`);
    
    const result = await interviewTurn({
      role: role.trim(),
      difficulty: difficulty || 'mid',
      messages: messages || []
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate question'
    });
  }
});

// Score completed interview
router.post('/score', async (req, res) => {
  try {
    const { role, messages } = req.body;

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    if (!messages || messages.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Not enough messages to score. Complete at least one Q&A.'
      });
    }

    console.log(`📊 Scoring interview for ${role}`);
    
    const result = await scoreInterview({
      role: role.trim(),
      messages
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to score interview'
    });
  }
});

module.exports = router;