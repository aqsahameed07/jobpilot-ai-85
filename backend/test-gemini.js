// backend/test-gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  console.log('🔑 Testing Gemini API...');
  console.log(`API Key: ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Please add GEMINI_API_KEY to .env file');
    return;
  }
  
  // Check key format
  if (!process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
    console.log('❌ Invalid API key format! Should start with "AIzaSy"');
    console.log(`Current key starts with: ${process.env.GEMINI_API_KEY.substring(0, 10)}...`);
    return;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Try the most reliable models
  const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`\n🔄 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Hello"');
      const response = await result.response;
      console.log(`✅ ${modelName} WORKS! Response: "${response.text().trim()}"`);
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message.substring(0, 100)}`);
    }
  }
}

testGemini();