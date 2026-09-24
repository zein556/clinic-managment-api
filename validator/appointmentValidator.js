const{body,param}=require('express-validator');
const handleValidationErrors=require('../middlewares/validationMiddleware');
const validateUpdateAppointment=[
    param('id').isInt().withMessage('Appointment ID must be an integer'),
    body('appointment_date').optional().isISO8601().withMessage('Appointment date format (must be YYYY-MM-DD)'),
    body('appointment_time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Appointment time must be in HH:mm format'),
    body('status').optional().isIn(['pending','confirmed','cancelled','completed']).withMessage('Status must be one of: pending, confirmed, cancelled, completed'),
handleValidationErrors
];
module.exports={
    validateUpdateAppointment
};