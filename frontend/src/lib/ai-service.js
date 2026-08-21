// frontend/src/lib/ai-service.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generate a cover letter using the backend API
 * @param {Object} params - Generation parameters
 * @param {string} params.company - Company name
 * @param {string} params.position - Job position
 * @param {string} params.tone - Tone of the letter
 * @param {string} params.resume - Resume content (optional)
 * @param {string} params.jobDescription - Job description (optional)
 * @returns {Promise<{content: string}>} Generated cover letter
 */
export const generateCoverLetter = async ({ company, position, tone, resume, jobDescription }) => {
  try {
    const response = await axios.post(`${API_URL}/api/cover-letter/generate`, {
      company,
      position,
      tone,
      resume,
      jobDescription
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate cover letter');
    }

    return response.data.data;
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to generate cover letter');
  }
};


export const analyzeResume = async ({ resume, jobDescription, applicationContext }) => {
  try {
    const response = await axios.post(`${API_URL}/api/resume/analyze`, {
      resume,
      jobDescription,
      applicationContext: applicationContext || null
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to analyze resume');
    }

    return response.data.data;
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Failed to analyze resume. Please try again.'
    );
  }
};

export const interviewTurn = async ({ role, difficulty, messages }) => {
  try {
    const response = await axios.post(`${API_URL}/api/interview/turn`, {
      role,
      difficulty,
      messages
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to generate question');
    }

    return response.data.data;
  } catch (error) {
    console.error('Interview turn error:', error);
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Failed to get interview question'
    );
  }
};

/**
 * Score completed interview
 */
export const scoreInterview = async ({ role, messages }) => {
  try {
    const response = await axios.post(`${API_URL}/api/interview/score`, {
      role,
      messages
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to score interview');
    }

    return response.data.data;
  } catch (error) {
    console.error('Interview scoring error:', error);
    throw new Error(
      error.response?.data?.error || 
      error.message || 
      'Failed to score interview'
    );
  }
};