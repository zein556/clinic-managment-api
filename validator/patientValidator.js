const { body, param } = require('express-validator');

exports.createPatientValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .withMessage('Username must be a string')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),

  body('age')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Age must be a valid number'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),

  body('medical_history')
    .optional()
    .isString()
    .withMessage('Medical history must be a string')
    .trim()
];

exports.updatePatientValidator = [
  param('id')
    .isInt()
    .withMessage('Patient ID must be an integer'),

  body('username')
    .optional()
    .isString()
    .withMessage('Username must be a string')
    .trim(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid phone number'),

  body('age')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Age must be a valid number'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be one of: male, female, other'),

  body('medical_history')
    .optional()
    .isString()
    .withMessage('Medical history must be a string')
    .trim()
];