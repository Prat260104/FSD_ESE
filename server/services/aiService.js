const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

class AIService {
  /**
   * Make a request to OpenRouter with retry logic
   */
  static async makeRequest(messages, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.post(
          OPENROUTER_URL,
          {
            model: AI_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 2000
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
              'X-Title': 'Candidate Shortlisting System'
            },
            timeout: 60000
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from AI');
        }

        return content;
      } catch (error) {
        console.error(`AI request attempt ${attempt}/${retries} failed:`, error.message);

        if (attempt === retries) {
          if (error.response?.status === 429) {
            throw new Error('AI service rate limited. Please try again later.');
          }
          if (error.response?.status === 401) {
            throw new Error('Invalid API key for AI service.');
          }
          throw new Error(`AI service error: ${error.message}`);
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Parse JSON from AI response (handles markdown code blocks)
   */
  static parseJSON(content) {
    try {
      // Try direct parse first
      return JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1].trim());
        } catch {
          // Fall through
        }
      }

      // Try finding JSON array or object in text
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch {
          // Fall through
        }
      }

      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          return JSON.parse(objectMatch[0]);
        } catch {
          // Fall through
        }
      }

      return null;
    }
  }

  /**
   * AI-powered candidate shortlisting
   */
  static async shortlistCandidates(candidates, requirements) {
    const candidatesList = candidates.map((c, i) => (
      `${i + 1}. ${c.name} | Skills: ${c.skills.join(', ')} | Experience: ${c.experience} years | Bio: ${c.bio || 'N/A'} | Projects: ${c.projects || 'N/A'}`
    )).join('\n');

    const prompt = `You are an expert AI recruiter analyzing candidates for a position.

JOB REQUIREMENTS:
- Required Skills: ${requirements.requiredSkills.join(', ')}
- Preferred Skills: ${requirements.preferredSkills?.join(', ') || 'None specified'}
- Minimum Experience: ${requirements.minExperience || 0} years

CANDIDATES:
${candidatesList}

Analyze each candidate and return a JSON array. For EACH candidate provide:
{
  "candidateIndex": <number starting from 0>,
  "name": "<candidate name>",
  "aiScore": <number 0-100>,
  "recommendation": "<Strongly Recommended|Recommended|Consider|Not Recommended>",
  "explanation": "<2-3 sentence explanation of why this candidate fits or doesn't fit>",
  "strengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>", "<concern2>"]
}

Sort by aiScore descending. Be fair, specific, and analytical. Return ONLY the JSON array, no other text.`;

    const content = await this.makeRequest([
      { role: 'system', content: 'You are an expert AI recruiter. Always respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ]);

    const parsed = this.parseJSON(content);

    if (!parsed || !Array.isArray(parsed)) {
      // Return a fallback text-based analysis
      return {
        type: 'text',
        analysis: content,
        candidates: candidates.map((c, i) => ({
          candidateIndex: i,
          name: c.name,
          aiScore: 50,
          recommendation: 'Consider',
          explanation: 'AI analysis returned in text format. See overall analysis.',
          strengths: [],
          concerns: []
        }))
      };
    }

    return {
      type: 'structured',
      candidates: parsed,
      analysis: `AI analyzed ${candidates.length} candidates against ${requirements.requiredSkills.length} required skills.`
    };
  }

  /**
   * Generate interview questions for a candidate
   */
  static async generateInterviewQuestions(candidate, requirements) {
    const prompt = `Generate 8 tailored interview questions for the following candidate:

CANDIDATE PROFILE:
- Name: ${candidate.name}
- Skills: ${candidate.skills.join(', ')}
- Experience: ${candidate.experience} years
- Bio: ${candidate.bio || 'Not provided'}
- Projects: ${candidate.projects || 'Not provided'}

JOB REQUIREMENTS:
- Required Skills: ${requirements.requiredSkills.join(', ')}
- Preferred Skills: ${requirements.preferredSkills?.join(', ') || 'None'}
- Minimum Experience: ${requirements.minExperience || 0} years

Generate questions that:
1. Test their claimed technical skills
2. Are appropriate for their experience level
3. Include both technical and behavioral questions
4. Are specific and relevant, not generic

Return a JSON array of objects:
[
  {
    "question": "<the interview question>",
    "category": "<Technical|Behavioral|Problem Solving|Experience|Culture Fit>",
    "difficulty": "<Easy|Medium|Hard>",
    "purpose": "<brief explanation of what this question assesses>"
  }
]

Return ONLY the JSON array.`;

    const content = await this.makeRequest([
      { role: 'system', content: 'You are an expert technical interviewer. Always respond with valid JSON only.' },
      { role: 'user', content: prompt }
    ]);

    const parsed = this.parseJSON(content);

    if (!parsed || !Array.isArray(parsed)) {
      // Return fallback
      return [
        { question: 'Tell me about your experience and background.', category: 'Behavioral', difficulty: 'Easy', purpose: 'Assess communication and background' },
        { question: `Explain your proficiency in ${candidate.skills[0] || 'your primary skill'}.`, category: 'Technical', difficulty: 'Medium', purpose: 'Verify claimed skills' },
        { question: 'Describe a challenging project you worked on.', category: 'Experience', difficulty: 'Medium', purpose: 'Evaluate problem-solving ability' },
        { question: `How would you approach a project requiring ${requirements.requiredSkills[0] || 'the required skills'}?`, category: 'Problem Solving', difficulty: 'Medium', purpose: 'Assess technical thinking' },
        { question: 'How do you stay updated with technology trends?', category: 'Culture Fit', difficulty: 'Easy', purpose: 'Gauge learning mindset' }
      ];
    }

    return parsed;
  }
}

module.exports = AIService;
