const {body}=require('express-validator');
const handleValidationErrors=require('../middlewares/handleValidation');
const validateRegisterUser=[
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().isLength({min:6}).withMessage('Password must be at least 6 characters long'),
   body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required'),
    handleValidationErrors
];

const validateLoginUser=[
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    handleValidationErrors
];
module.exports={
    validateRegisterUser,
    validateLoginUser

};