const { body, param } = require('express-validator');
// Validate data when Admin creates a patient.
exports.createPatientValidator = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string')
        .trim(),

    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isMobilePhone().withMessage('Invalid phone number'),

    body('age')
        .optional()
        .isInt({ min: 0 }).withMessage('Age must be a positive number'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender'),

    body('medical_history')
        .optional()
        .isString().withMessage('Medical history must be a string')
        .trim()
];

// Validate Admin updating a patient.
exports.updatePatientValidator = [
    param('id')
        .isInt().withMessage('Patient ID must be an integer'),

    body()
        .custom((value) => Object.keys(value || {}).length > 0)
        .withMessage('At least one field must be provided'),

    body('username')
        .optional()
        .isString().withMessage('Username must be a string')
        .trim()
        .notEmpty().withMessage('Username cannot be empty'),

    body('phone')
        .optional()
        .isMobilePhone().withMessage('Invalid phone number'),

    body('age')
        .optional()
        .isInt({ min: 0 }).withMessage('Age must be a positive number'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender')
];

// Validate a patient updating their own profile.
exports.updateMyProfileValidator = [
    body()
        .custom((value) => Object.keys(value || {}).length > 0)
        .withMessage('At least one field must be provided'),

    body('username')
        .optional()
        .isString().withMessage('Username must be a string')
        .trim()
        .notEmpty().withMessage('Username cannot be empty'),

    body('phone')
        .optional()
        .isMobilePhone().withMessage('Invalid phone number'),

    body('age')
        .optional()
        .isInt({ min: 0 }).withMessage('Age must be a positive number'),

    body('gender')
        .optional()
        .isIn(['male', 'female', 'other']).withMessage('Invalid gender')
];