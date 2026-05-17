const Candidate = require('../models/Candidate');
const MatchingService = require('../services/matchingService');
const AIService = require('../services/aiService');

// @desc    Match candidates against job requirements (backend logic)
// @route   POST /api/match
exports.matchCandidates = async (req, res, next) => {
  try {
    const { requiredSkills, preferredSkills = [], minExperience = 0 } = req.body;

    // Get all candidates for this user
    const candidates = await Candidate.find({ createdBy: req.user._id });

    if (candidates.length === 0) {
      return res.status(404).json({
        message: 'No candidates found. Please add candidates first.'
      });
    }

    const requirements = { requiredSkills, preferredSkills, minExperience };
    const { results, summary } = MatchingService.rankCandidates(candidates, requirements);

    res.json({
      message: 'Matching completed successfully',
      requirements,
      results,
      summary
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI-powered shortlisting using OpenRouter
// @route   POST /api/ai/shortlist
exports.aiShortlist = async (req, res, next) => {
  try {
    const { requiredSkills, preferredSkills = [], minExperience = 0 } = req.body;

    const candidates = await Candidate.find({ createdBy: req.user._id });

    if (candidates.length === 0) {
      return res.status(404).json({
        message: 'No candidates found. Please add candidates first.'
      });
    }

    const requirements = { requiredSkills, preferredSkills, minExperience };

    // First, get backend matching results
    const { results: matchResults, summary } = MatchingService.rankCandidates(candidates, requirements);

    // Then, get AI analysis
    let aiAnalysis;
    try {
      aiAnalysis = await AIService.shortlistCandidates(candidates, requirements);
    } catch (aiError) {
      console.error('AI analysis failed:', aiError.message);
      aiAnalysis = {
        type: 'error',
        analysis: 'AI analysis is temporarily unavailable. Showing algorithm-based results.',
        candidates: []
      };
    }

    // Merge backend scores with AI analysis
    const mergedResults = matchResults.map(result => {
      const aiCandidate = aiAnalysis.candidates?.find(
        ac => ac.name === result.candidate.name || ac.candidateIndex === matchResults.indexOf(result)
      );

      return {
        ...result,
        aiScore: aiCandidate?.aiScore || result.matchScore,
        aiRecommendation: aiCandidate?.recommendation || result.recommendation,
        aiExplanation: aiCandidate?.explanation || 'AI analysis not available for this candidate.',
        strengths: aiCandidate?.strengths || [],
        concerns: aiCandidate?.concerns || []
      };
    });

    // Sort by combined score (50% algo + 50% AI)
    mergedResults.sort((a, b) => {
      const scoreA = (a.matchScore + a.aiScore) / 2;
      const scoreB = (b.matchScore + b.aiScore) / 2;
      return scoreB - scoreA;
    });

    mergedResults.forEach((r, i) => { r.rank = i + 1; });

    res.json({
      message: 'AI shortlisting completed',
      requirements,
      results: mergedResults,
      summary: {
        ...summary,
        aiAnalysis: aiAnalysis.analysis || ''
      },
      aiAvailable: aiAnalysis.type !== 'error'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI interview questions for a candidate
// @route   POST /api/ai/interview-questions
exports.generateInterviewQuestions = async (req, res, next) => {
  try {
    const { candidateId, requiredSkills, preferredSkills = [], minExperience = 0 } = req.body;

    const candidate = await Candidate.findOne({
      _id: candidateId,
      createdBy: req.user._id
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const requirements = { requiredSkills, preferredSkills, minExperience };

    let questions;
    try {
      questions = await AIService.generateInterviewQuestions(candidate, requirements);
    } catch (aiError) {
      console.error('AI interview questions failed:', aiError.message);
      questions = [
        { question: `Tell me about your experience with ${candidate.skills[0] || 'your primary technology'}.`, category: 'Technical', difficulty: 'Medium', purpose: 'Verify core technical skills' },
        { question: 'Describe the most challenging project you have worked on.', category: 'Experience', difficulty: 'Medium', purpose: 'Assess problem-solving ability' },
        { question: 'How do you approach learning a new technology?', category: 'Behavioral', difficulty: 'Easy', purpose: 'Evaluate growth mindset' },
        { question: `How would you solve a problem requiring ${requiredSkills[0] || 'the required skills'}?`, category: 'Problem Solving', difficulty: 'Hard', purpose: 'Test applied thinking' },
        { question: 'How do you handle disagreements with team members?', category: 'Culture Fit', difficulty: 'Easy', purpose: 'Assess team collaboration' }
      ];
    }

    res.json({
      message: 'Interview questions generated',
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        skills: candidate.skills,
        experience: candidate.experience
      },
      questions
    });
  } catch (error) {
    next(error);
  }
};
