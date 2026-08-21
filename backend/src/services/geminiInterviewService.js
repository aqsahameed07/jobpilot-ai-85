// backend/src/services/geminiInterviewService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// WORKING MODELS FROM DEBUG
// ============================================================
const MODEL_NAMES = [
  'gemini-flash-latest',     // ✅ WORKING
  'gemini-3-flash-preview',  // ✅ WORKING
];

let cachedModel = null;
let lastModelIndex = 0;

/**
 * Get a working model
 */
async function getWorkingModel() {
  // Return cached model if we have one
  if (cachedModel) {
    try {
      const test = await cachedModel.generateContent('test');
      await test.response.text();
      return cachedModel;
    } catch (error) {
      console.log('🔄 Cached model failed, finding new one...');
      cachedModel = null;
    }
  }

  // Try each working model
  for (let i = 0; i < MODEL_NAMES.length; i++) {
    const index = (lastModelIndex + i) % MODEL_NAMES.length;
    const modelName = MODEL_NAMES[index];
    
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('OK');
      await result.response.text();
      console.log(`✅ Using model: ${modelName}`);
      cachedModel = model;
      lastModelIndex = index;
      return model;
    } catch (error) {
      if (error.message.includes('429')) {
        console.log(`⏳ ${modelName} rate limited, waiting 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 50)}`);
      }
    }
  }
  
  cachedModel = null;
  throw new Error('No working Gemini model found.');
}

/**
 * Generate interview question using Gemini API
 */
const interviewTurn = async ({ role, difficulty, messages }) => {
  try {
    console.log(`📝 Generating interview question for ${role} (${difficulty})`);
    
    const model = await getWorkingModel();

    // Build the prompt
    let promptText = `You are an expert technical interviewer conducting a ${difficulty} level interview for a ${role} position.

**IMPORTANT: Ask questions that are SPECIFIC to the ${role} role.**

**Rules:**
1. Ask ONE question at a time
2. Keep questions clear and concise (2-3 sentences max)
3. Adapt to the candidate's responses
4. Be professional but conversational
5. Cover technical, behavioral, and problem-solving questions

**Conversation History:**
`;
    
    if (!messages || messages.length === 0) {
      promptText += `(No previous messages - this is the start of the interview)

**TASK:** Ask the first question. Start with a brief introduction and then ask the first question specific to the ${role} role.`;
    } else {
      // Get last 6 messages for context
      const recentMessages = messages.slice(-6);
      recentMessages.forEach(function(msg) {
        const speaker = msg.role === 'assistant' ? 'Interviewer' : 'Candidate';
        promptText += '\n' + speaker + ': ' + msg.content;
      });
      
      promptText += `\n\n**TASK:** Based on the candidate's last response, ask the NEXT appropriate question. 
Keep it conversational and follow up on their answers when relevant. Make sure it's specific to the ${role} role.`;
    }

    promptText += `\n\n**Generate ONLY the question/response, no additional text:**`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const generatedText = response.text();
    
    console.log('✅ REAL Gemini question generated!');
    return { content: generatedText.trim(), isFallback: false, provider: 'gemini' };
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw new Error('Gemini API error: ' + error.message);
  }
};

/**
 * Score interview using Gemini API
 */
const scoreInterview = async ({ role, messages }) => {
  try {
    console.log(`📊 Scoring interview for ${role}`);
    
    const model = await getWorkingModel();

    // Build the prompt
    let promptText = `You are an expert hiring manager and interview coach. Evaluate this ${role} interview and provide detailed feedback.

**Interview Transcript:**
`;
    
    // Get last 20 messages
    const recentMessages = messages.slice(-20);
    recentMessages.forEach(function(msg) {
      const speaker = msg.role === 'assistant' ? 'Interviewer' : 'Candidate';
      promptText += '\n' + speaker + ': ' + msg.content;
    });

    promptText += `\n\n**TASK:** Provide a comprehensive evaluation. Return ONLY valid JSON with this structure:

{
  "score": <number 0-100>,
  "feedback": "<Overall feedback 2-3 sentences>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "technical_rating": <0-100>,
  "communication_rating": <0-100>,
  "problem_solving_rating": <0-100>,
  "recommendation": "<Would you hire? Yes/With training/No>",
  "key_topics_covered": ["<topic 1>", "<topic 2>"],
  "missed_opportunities": ["<opportunity 1>", "<opportunity 2>"]
}

**SCORING GUIDELINES:**
- 90-100: Exceptional, ready for the role
- 75-89: Good, minor improvements needed
- 60-74: Adequate, needs more practice
- Below 60: Needs significant preparation

**Be honest and constructive in your feedback.**`;

    const result = await model.generateContent(promptText);
    const response = await result.response;
    const generatedText = response.text();
    
    // Parse JSON
    let analysis;
    try {
      let cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(cleanedText);
      }
    } catch (error) {
      console.error('❌ Failed to parse JSON:', error);
      // Return default scores if parsing fails
      return {
        score: 50,
        feedback: "Unable to analyze interview properly. Please try again.",
        strengths: ["Completed the interview"],
        improvements: ["Provide more detailed answers"],
        technical_rating: 50,
        communication_rating: 50,
        problem_solving_rating: 50,
        recommendation: "Needs more practice",
        key_topics_covered: [],
        missed_opportunities: []
      };
    }
    
    // Ensure all fields exist
    analysis = ensureScoreFields(analysis);
    
    console.log('✅ REAL Gemini scoring complete!');
    return analysis;
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw new Error('Gemini API error: ' + error.message);
  }
};

/**
 * Ensure all score fields exist
 */
function ensureScoreFields(analysis) {
  return {
    score: analysis.score || 50,
    feedback: analysis.feedback || "Review your answers and practice more.",
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
    technical_rating: analysis.technical_rating || 50,
    communication_rating: analysis.communication_rating || 50,
    problem_solving_rating: analysis.problem_solving_rating || 50,
    recommendation: analysis.recommendation || "Needs more practice",
    key_topics_covered: Array.isArray(analysis.key_topics_covered) ? analysis.key_topics_covered : [],
    missed_opportunities: Array.isArray(analysis.missed_opportunities) ? analysis.missed_opportunities : []
  };
}

module.exports = { interviewTurn, scoreInterview };