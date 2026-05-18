const mongoose = require('mongoose');

const evaluatedEmployeeSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  evaluationScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  strengths: {
    type: [String],
    default: []
  },
  areasForImprovement: {
    type: [String],
    default: []
  },
  aiFeedback: {
    type: String,
    default: ''
  },
  recommendation: {
    type: String,
    enum: ['Promote', 'Strongly Recommend Promotion', 'Needs Training', 'Performance Plan', 'Excellent', 'Good', 'Average', 'Poor'],
    default: 'Average'
  }
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Evaluation title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  criteria: {
    requiredSkills: {
      type: [String],
      default: []
    },
    targetDepartment: {
      type: String,
      default: ''
    },
    minPerformanceScore: {
      type: Number,
      default: 0
    }
  },
  employees: [evaluatedEmployeeSchema],
  aiAnalysisSummary: {
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

evaluationSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Evaluation', evaluationSchema);
