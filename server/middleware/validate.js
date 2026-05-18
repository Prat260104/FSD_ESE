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

// Employee validation rules
const validateEmployee = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  body('performanceScore')
    .notEmpty().withMessage('Performance score is required')
    .isFloat({ min: 0, max: 100 }).withMessage('Performance score must be between 0 and 100'),
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  body('experience')
    .notEmpty().withMessage('Experience is required')
    .isFloat({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio cannot exceed 2000 characters'),
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

// Evaluation validation rules
const validateEvaluation = [
  body('requiredSkills')
    .optional()
    .isArray().withMessage('Required skills must be an array'),
  body('targetDepartment')
    .optional()
    .trim(),
  body('minPerformanceScore')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Minimum performance score must be between 0 and 100'),
  handleValidation
];

module.exports = {
  validateEmployee,
  validateRegister,
  validateLogin,
  validateEvaluation,
  handleValidation
};
