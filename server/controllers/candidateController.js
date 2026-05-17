const Candidate = require('../models/Candidate');

// @desc    Create a new candidate
// @route   POST /api/candidates
exports.createCandidate = async (req, res, next) => {
  try {
    const { name, email, skills, experience, bio, projects } = req.body;

    // Clean skills array
    const cleanedSkills = skills.map(s => s.trim()).filter(s => s.length > 0);

    const candidate = await Candidate.create({
      name,
      email,
      skills: cleanedSkills,
      experience,
      bio: bio || '',
      projects: projects || '',
      createdBy: req.user._id
    });

    res.status(201).json({
      message: 'Candidate created successfully',
      candidate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidates with search, filter, and pagination
// @route   GET /api/candidates
exports.getCandidates = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      skill,
      minExp,
      maxExp,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { createdBy: req.user._id };

    // Search by name, email, or skills
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by skill
    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    // Filter by experience range
    if (minExp || maxExp) {
      query.experience = {};
      if (minExp) query.experience.$gte = parseFloat(minExp);
      if (maxExp) query.experience.$lte = parseFloat(maxExp);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [candidates, total] = await Promise.all([
      Candidate.find(query).sort(sort).skip(skip).limit(limitNum),
      Candidate.countDocuments(query)
    ]);

    res.json({
      candidates,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCandidates: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
exports.getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ candidate });
  } catch (error) {
    next(error);
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
exports.updateCandidate = async (req, res, next) => {
  try {
    const { name, email, skills, experience, bio, projects } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (skills !== undefined) updateData.skills = skills.map(s => s.trim()).filter(s => s.length > 0);
    if (experience !== undefined) updateData.experience = experience;
    if (bio !== undefined) updateData.bio = bio;
    if (projects !== undefined) updateData.projects = projects;

    const candidate = await Candidate.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({
      message: 'Candidate updated successfully',
      candidate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
exports.deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    next(error);
  }
};
