const express =require('express');
const router= express.Router();
const {body}=require('express-validator');
const authMiddleware=require('../middlewares/authMiddleware');
const checkrole=require('../middlewares/RoleMiddleware');
const validationMiddleware=require('../middlewares/validationMiddleware');
const patientsController=require('../controllers/patientsController');
const updatePatientValidationRules=[
    body('name')
    .optional()
    .trim()
    .isLength({min:3}).withMessage('Name must be at least 3 characters long'),
    body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Invalid phone number format'),
    body('age')
    .optional()
    .isInt({min:3,max:120}).withMessage('Age must be a valid number between 0 and 120'),
    body('gender')
    .optional()
    .isIn(['male','female','Male','Female']).withMessage('Gender must be male or female')
];

router.get('/',authMiddleware,checkrole(['admin','doctor']),patientsController.getPatients);
router.get('/:id',authMiddleware,checkrole(['admin','doctor']),patientsController.getPatientById);

router.put('/:id',authMiddleware,checkrole(['admin']),updatePatientValidationRules,validationMiddleware,patientsController.updatePatient);
router.delete('/:id',authMiddleware,checkrole(['admin']),patientsController.deletePatient);
module.exports=router;

