const axios = require('axios');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'gpt-3.5-turbo'; 

const makeRequest = async (prompt, systemPrompt) => {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL,
          'X-Title': 'Employee Analytics System'
        },
        timeout: 25000 // 25 second timeout
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Service Error:', error?.response?.data || error.message);
    throw new Error('AI analysis failed. Please try again.');
  }
};

exports.analyzeEmployees = async (employees, criteria) => {
  const systemPrompt = `You are an expert HR AI Performance Analyst. Your task is to evaluate employees based on their performance scores, experience, and skills against the target criteria. You MUST respond in pure JSON format containing a "results" array and a "summary" object.`;

  const prompt = `
    Target Evaluation Criteria:
    - Target Department: ${criteria.targetDepartment || 'Any'}
    - Required Skills: ${criteria.requiredSkills?.join(', ') || 'None'}
    - Minimum Performance Score: ${criteria.minPerformanceScore || 0}
    
    Employees to Evaluate:
    ${employees.map((e, i) => `
    [${i+1}] Name: ${e.name}
    Department: ${e.department}
    Experience: ${e.experience} years
    Performance Score: ${e.performanceScore}/100
    Skills: ${e.skills.join(', ')}
    Bio: ${e.bio || 'N/A'}
    `).join('\n')}
    
    Return a JSON object with this exact structure:
    {
      "results": [
        {
          "index": <number referencing the employee 1-${employees.length}>,
          "aiScore": <number 0-100 based on fit and performance>,
          "recommendation": <"Promote" | "Strongly Recommend Promotion" | "Needs Training" | "Performance Plan" | "Excellent" | "Good" | "Average" | "Poor">,
          "aiFeedback": "<detailed 2-3 sentence feedback explaining the score and recommendation>",
          "strengths": ["<strength1>", "<strength2>"],
          "areasForImprovement": ["<area1>", "<area2>"]
        }
      ],
      "summary": {
        "aiAnalysisSummary": "<Overall 3-4 sentence summary of the workforce analyzed>"
      }
    }
  `;

  return makeRequest(prompt, systemPrompt);
};

exports.generateFeedback = async (employee, criteria) => {
  const systemPrompt = `You are a professional HR mentor and coach. Generate constructive feedback and training suggestions for an employee. Respond strictly in JSON format.`;

  const prompt = `
    Employee Details:
    Name: ${employee.name}
    Department: ${employee.department}
    Performance Score: ${employee.performanceScore}/100
    Experience: ${employee.experience} years
    Skills: ${employee.skills.join(', ')}
    
    Target Department/Role Criteria (Optional Context):
    ${criteria.targetDepartment ? `- Target: ${criteria.targetDepartment}` : ''}
    ${criteria.requiredSkills ? `- Required Skills: ${criteria.requiredSkills.join(', ')}` : ''}
    
    Please provide actionable feedback and specific training suggestions to help this employee improve their performance and skill set.
    
    Return a JSON object with this structure:
    {
      "feedback": [
        {
          "category": "<e.g., Technical, Leadership, Soft Skills, Performance>",
          "suggestion": "<Specific advice or actionable item>",
          "impact": "<Why this is important>"
        }
      ],
      "overallAssessment": "<A 2-3 sentence overall encouraging assessment>"
    }
  `;

  return makeRequest(prompt, systemPrompt);
};
