// backend/debug-models.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in .env file');
      return;
    }
    
    console.log('🔑 Using API Key:', apiKey.substring(0, 15) + '...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use models from your available list
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-2.5-flash-lite',
      'gemini-3-flash-preview'
    ];
    
    let success = false;
    let workingModels = [];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`\n🔄 Testing: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Say "Hello, API is working!" in 3 words.');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ SUCCESS with: ${modelName}`);
        console.log(`Response: "${text.trim()}"`);
        workingModels.push(modelName);
        success = true;
      } catch (error) {
        console.log(`❌ Failed: ${error.message.substring(0, 80)}`);
      }
    }
    
    if (success) {
      console.log('\n✅ Working models found:', workingModels.join(', '));
      console.log(`\n💡 Recommended: ${workingModels[0]}`);
    } else {
      console.log('\n❌ No models worked. Please check your API key permissions.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();