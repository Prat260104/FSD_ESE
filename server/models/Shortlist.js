const mongoose = require('mongoose');

const shortlistedCandidateSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  aiExplanation: {
    type: String,
    default: ''
  },
  recommendation: {
    type: String,
    enum: ['High Match', 'Medium Match', 'Low Match', 'Strongly Recommended', 'Recommended', 'Consider', 'Not Recommended'],
    default: 'Low Match'
  }
}, { _id: false });

const shortlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Shortlist title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  jobRequirements: {
    requiredSkills: {
      type: [String],
      default: []
    },
    preferredSkills: {
      type: [String],
      default: []
    },
    minExperience: {
      type: Number,
      default: 0
    }
  },
  candidates: [shortlistedCandidateSchema],
  aiAnalysis: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

shortlistSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Shortlist', shortlistSchema);
