const {body}=require('express-validator');
const validateRegisterUser=[
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
    body('password').trim().isLength({min:6}).withMessage('Password must be at least 6 characters long'),
   body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required'),
    
];

const validateLoginUser=[
    body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Valid email is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
    
];
module.exports={
    validateRegisterUser,
    validateLoginUser

};