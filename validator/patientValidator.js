const {body,param}=require('express-validator');
exports.createPatientValidator=[
    body('user_id').notEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
    body('gender').notEmpty().withMessage('Gender is required').isIn(['male','female','other']).withMessage('Gender must be one of: male, female, other'),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number is required'),
    body('medical_history').optional().isString().withMessage('Medical history must be a string').trim(),
    exports.updatePatientValidator=[
        param('id').isInt().withMessage('Patient ID must be an integer'),
    
        body('gender').optional().isIn(['   male','female','other']).withMessage('Gender must be one of:  male, female, other'),
        body('phone').optional().isMobilePhone().withMessage('Invalid phone number is required'),
        body('medical_history').optional().isString().withMessage('Medical history must be a text')
    ]       

];