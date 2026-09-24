const {body}=require('express-validator');
exports.createDoctorValidator=[
   // body('userId').notEmpty().withMessage('User ID is required').isInt().withMessage('User ID must be an integer'),
    body('specialty').notEmpty().withMessage('Specialization is required').isString().withMessage('Specialization must be a string')
    .trim(),
    body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required'),
    body('consultion_fee').optional().isFloat({min:0}).withMessage('Consultation fee must be a positive number'),
    exports.updateDoctorValidator=[
        body('specialty').optional().isString().withMessage('Specialization must be a string').trim(),
        body('phone_number').optional().isMobilePhone().withMessage('Valid phone number is required'),
        body('consultion_fee').optional().isFloat({min:0}).withMessage('Consultation fee must be a positive number'),
    ]
];