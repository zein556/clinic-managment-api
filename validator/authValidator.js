
const { body } = require('express-validator');

const validateRegisterUser = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone()
        .withMessage('Valid phone number is required'),

    body('age')
        .notEmpty()
        .withMessage('Age is required')
        .isInt({ min: 0 })
        .withMessage('Age must be a valid non-negative integer'),

    body('gender')
        .notEmpty()
        .withMessage('Gender is required')
        .isIn(['male', 'female', 'other'])
        .withMessage('Gender must be male, female, or other'),
];

const validateLoginUser = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required'),
];

module.exports = {
    validateRegisterUser,
    validateLoginUser
};
