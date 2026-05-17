const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => e.msg)
    });
  }
  next();
};

// Candidate validation rules
const validateCandidate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('skills.*')
    .trim()
    .notEmpty().withMessage('Skill cannot be empty'),
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio cannot exceed 2000 characters'),
  body('projects')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Projects cannot exceed 3000 characters'),
  handleValidation
];

// Auth validation rules
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidation
];

// Match validation rules
const validateMatch = [
  body('requiredSkills')
    .isArray({ min: 1 }).withMessage('At least one required skill is needed'),
  body('requiredSkills.*')
    .trim()
    .notEmpty().withMessage('Required skill cannot be empty'),
  body('preferredSkills')
    .optional()
    .isArray().withMessage('Preferred skills must be an array'),
  body('minExperience')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum experience must be a positive number'),
  handleValidation
];

module.exports = {
  validateCandidate,
  validateRegister,
  validateLogin,
  validateMatch,
  handleValidation
};
