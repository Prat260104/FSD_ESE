const Shortlist = require('../models/Shortlist');

// @desc    Save a shortlist
// @route   POST /api/shortlists
exports.saveShortlist = async (req, res, next) => {
  try {
    const { title, jobRequirements, candidates, aiAnalysis } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Shortlist title is required' });
    }

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ message: 'At least one candidate is required' });
    }

    const shortlist = await Shortlist.create({
      title,
      jobRequirements: jobRequirements || {},
      candidates: candidates.map(c => ({
        candidate: c.candidateId || c.candidate,
        matchScore: c.matchScore || 0,
        matchedSkills: c.matchedSkills || [],
        missingSkills: c.missingSkills || [],
        aiExplanation: c.aiExplanation || '',
        recommendation: c.recommendation || 'Low Match'
      })),
      aiAnalysis: aiAnalysis || '',
      createdBy: req.user._id
    });

    // Populate candidate details
    await shortlist.populate('candidates.candidate');

    res.status(201).json({
      message: 'Shortlist saved successfully',
      shortlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all shortlists
// @route   GET /api/shortlists
exports.getShortlists = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [shortlists, total] = await Promise.all([
      Shortlist.find({ createdBy: req.user._id })
        .populate('candidates.candidate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Shortlist.countDocuments({ createdBy: req.user._id })
    ]);

    res.json({
      shortlists,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalShortlists: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shortlist
// @route   GET /api/shortlists/:id
exports.getShortlist = async (req, res, next) => {
  try {
    const shortlist = await Shortlist.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    }).populate('candidates.candidate');

    if (!shortlist) {
      return res.status(404).json({ message: 'Shortlist not found' });
    }

    res.json({ shortlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shortlist
// @route   DELETE /api/shortlists/:id
exports.deleteShortlist = async (req, res, next) => {
  try {
    const shortlist = await Shortlist.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!shortlist) {
      return res.status(404).json({ message: 'Shortlist not found' });
    }

    res.json({ message: 'Shortlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
