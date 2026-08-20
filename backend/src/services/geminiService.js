// backend/src/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use the working model from your debug
const WORKING_MODEL = 'gemini-3-flash-preview';

let cachedModel = null;

/**
 * Get a working model
 */
async function getWorkingModel() {
  if (cachedModel) {
    return cachedModel;
  }

  try {
    console.log(`🔄 Using model: ${WORKING_MODEL}`);
    const model = genAI.getGenerativeModel({ model: WORKING_MODEL });
    const result = await model.generateContent('Test');
    await result.response.text();
    console.log(`✅ Using model: ${WORKING_MODEL}`);
    cachedModel = model;
    return model;
  } catch (error) {
    console.error('❌ Model error:', error);
    throw new Error('No working Gemini model found.');
  }
}

/**
 * Generate a 10/10 premium quality cover letter
 */
const generateCoverLetter = async ({ company, position, tone = 'professional', resume, jobDescription }) => {
  try {
    console.log(`📝 Generating 10/10 cover letter for ${position} at ${company}`);
    
    const model = await getWorkingModel();

    // ============================================================
    // 10/10 ULTIMATE PREMIUM PROMPT
    // ============================================================
    const prompt = `You are a world-class executive resume writer and career strategist who has helped 500+ professionals land roles at Google, Microsoft, Amazon, and top tech companies. Your cover letters have a 95% interview success rate. Generate a masterpiece cover letter that will make the hiring manager immediately want to interview this candidate.

**POSITION:** ${position}
**COMPANY:** ${company}
**TONE:** ${tone}

**CANDIDATE RESUME:**
${resume || 'No resume provided'}

**JOB DESCRIPTION:**
${jobDescription || 'No job description provided'}

---

**🎯 10/10 COVER LETTER REQUIREMENTS:**

**Format & Structure (10/10):**
- Perfect business letter format
- Candidate full name, phone, email, location
- Current date
- Hiring Manager, Company Name, Full Address
- "RE: ${position} - [Candidate Name]" 
- "Dear Hiring Manager,"
- Professional closing: "Sincerely," or "Best regards,"

---

**📝 PARAGRAPH 1: THE HOOK (3-4 sentences)**
Requirements:
- Open with a POWERFUL statement that grabs attention
- Show DEEP RESEARCH about the company (mention specific projects, values, or recent achievements)
- Express GENUINE ENTHUSIASM for the role
- Include 2-3 KEYWORDS from the job description
- State your value proposition clearly
- Make it unique to this company (not generic)

**📝 PARAGRAPH 2: TECHNICAL MASTERY (4-5 sentences)**
Requirements:
- Match EVERY technical requirement from the job description
- For each skill, provide a SPECIFIC EXAMPLE from experience
- Include at least 3-4 QUANTIFIED achievements
- Use EXACT keywords from the job description
- Show DEPTH of knowledge, not just breadth
- Mention PREFERRED SKILLS (TypeScript, Next.js, AWS, CI/CD, Agile)
- Demonstrate PROBLEM-SOLVING ability

**📝 PARAGRAPH 3: EXPERIENCE & PROJECTS (4-5 sentences)**
Requirements:
- Highlight the MOST RELEVANT experience first
- If experience is limited, REFRAME IT POSITIVELY:
  - "While I am early in my professional journey, I have deliberately pursued intensive learning..."
  - "Through hands-on projects and internships, I have accumulated the equivalent of X years of experience..."
  - "My rapid advancement from intern to independent contributor demonstrates..."
- Include 2-3 SPECIFIC PROJECT DETAILS
- Add 2-3 more QUANTIFIED METRICS
- Show PROGRESSION and GROWTH
- Demonstrate IMPACT and RESULTS

**📝 PARAGRAPH 4: CULTURAL FIT & SOFT SKILLS (3-4 sentences)**
Requirements:
- Match company CULTURE and VALUES
- Show EMOTIONAL INTELLIGENCE
- Mention 2-3 SOFT SKILLS from the job description
- Demonstrate COLLABORATION abilities
- Show LEADERSHIP potential
- Connect personal values to company mission
- Mention RELEVANT CERTIFICATIONS and continuous learning

**📝 PARAGRAPH 5: CLOSING WITH CONFIDENCE (3-4 sentences)**
Requirements:
- Reiterate ENTHUSIASM with specific reasons
- Mention attached RESUME
- CONFIDENTLY invite for an interview
- Show you're READY to contribute immediately
- Thank the hiring manager
- End with PROFESSIONAL closing

---

**🔑 CRITICAL RULES FOR 10/10 QUALITY:**

**1. QUANTIFY EVERYTHING (Minimum 5-7 Metrics):**
   - Years of experience (even if from projects)
   - Number of features, components, or applications built
   - Percentage improvements (load time, responsiveness, efficiency)
   - Number of users or clients served
   - Team sizes or scale of projects
   - Performance metrics
   - Revenue impact (if applicable)

**2. USE 10+ KEYWORDS FROM JOB DESCRIPTION:**
   - Scan the job description CAREFULLY
   - Use EXACT phrases from the requirements
   - Include ALL required tech stack terms
   - Include AT LEAST 3 preferred skills

**3. BRIDGE EXPERIENCE GAPS PERFECTLY:**
   - NEVER apologize for limited experience
   - REFRAME it as INTENSIVE learning
   - Position projects as EQUIVALENT experience
   - Show RAPID growth and progression
   - Demonstrate QUALITY over quantity
   - Use phrases like:
     * "While I am early in my career, I have..."
     * "Through intensive project-based learning, I have..."
     * "My hands-on experience includes..."
     * "I have demonstrated ability to..."

**4. MAKE IT UNIQUE TO THE COMPANY:**
   - Research the company's mission
   - Mention specific projects or values
   - Show you understand their market
   - Connect your skills to their needs
   - NO generic phrases

**5. SHOW, DON'T TELL:**
   - ❌ "I am a hard worker" 
   - ✅ "I consistently delivered features ahead of schedule"
   - ❌ "I have good communication skills"
   - ✅ "I collaborated with cross-functional teams of 8+ members"
   - ❌ "I am passionate about coding"
   - ✅ "I built 3 full-stack applications in my free time"

**6. PERFECT TONE:**
   - Confident but not arrogant
   - Enthusiastic but not desperate
   - Professional but not stiff
   - Ambitious but realistic
   - Knowledgeable but humble

**7. WORD COUNT:**
   - Exactly 420-450 words
   - 5 paragraphs
   - Professional spacing

**8. GRAMMAR & STYLE:**
   - Perfect grammar
   - Active voice
   - Varied sentence structure
   - No clichés
   - No spelling errors

---

**🚀 ADDITIONAL INSTRUCTIONS FOR SPECIFIC SCENARIOS:**

**If Candidate Has < 2 Years Experience:**
- Frame as: "Early-career developer with intensive project experience"
- Emphasize: "I bring fresh perspectives and modern skills"
- Show: "Accelerated learning evidenced by 4+ certifications in 8 months"
- Position: "Project experience equivalent to 2+ years of professional work"

**If Candidate Has No Degree in CS:**
- Emphasize relevant certifications
- Show practical skills over formal education
- Highlight problem-solving abilities
- Mention continuous learning

**If Candidate Has Employment Gaps:**
- Frame positively as "strategic learning period"
- Mention certifications, projects, or freelance work
- Show how this enhanced skills
- Focus on results, not timeline

---

**❌ FORBIDDEN PHRASES TO NEVER USE:**
- "I believe I am a good fit"
- "I hope you will consider my application"
- "I don't have much experience but..."
- "I am applying for this job because..."
- "I have limited experience in..."
- Any negative language
- Any apologetic tone
- Any generic statements

---

**✅ MANDATORY INCLUSIONS:**
- 5-7 quantifiable achievements
- 10+ keywords from job description
- Specific company research
- Perfect formatting
- Confident, professional tone
- Strong call to action

---

**BEGIN GENERATING THE 10/10 COVER LETTER NOW. OUTPUT ONLY THE COVER LETTER, NO ADDITIONAL TEXT OR ANALYSIS:**

`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let coverLetter = response.text();
    
    // Clean up the response
    coverLetter = coverLetter
      .replace(/^Cover Letter:\s*/i, '')
      .replace(/^Here is a (professional|10\/10|premium) cover letter:\s*/i, '')
      .replace(/^Dear Hiring Manager,/i, 'Dear Hiring Manager,')
      .replace(/^Sincerely,/i, 'Sincerely,')
      .replace(/^Best regards,/i, 'Best regards,')
      .trim();
    
    console.log('✅ 10/10 premium cover letter generated successfully!');
    return { content: coverLetter };
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    throw new Error(`Failed to generate cover letter: ${error.message}`);
  }
};

module.exports = { generateCoverLetter };