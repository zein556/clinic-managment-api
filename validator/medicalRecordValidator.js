const {body,param}=require('express-validator');
const createRecordValidation=[
    body('appointment_id')
    .isInt().withMessage('Appointment ID must be an integer'),
    body('diagnosis')
    .trim()
    .notEmpty().withMessage('Diagnosis is required'),
    body('notes')
    .optional()
    .isString().withMessage('Notes must be a string'),
    body('prescriptions')
    .optional()
    .isArray().withMessage('Prescriptions must be an array'),
    body('prescriptions.*.medication_name')
    .optional()
    .notEmpty().withMessage('Medication name is required'),
    body('prescriptions.*.dosage')
    .optional()
    .notEmpty().withMessage('Dosage is required'),
       
    body('prescriptions.*.instructions')
    .optional()
    .isString().withMessage('Instructions must be a string')
];
const getPatientHistoryValidation=[
    param('patient_id')
    .isInt().withMessage('Patient ID must be an integer')
];

module.exports={
    createRecordValidation
    ,getPatientHistoryValidation
};