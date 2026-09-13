const express=require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const{body}=require('express-validator');
const validationMiddleware=require('../middlewares/validationMiddleware');
const checkRole=require('../middlewares/RoleMiddleware');
const router=express.Router();

    const doctorsController=require('../controllers/doctorsController');
   
    const doctorValidationRules=[
        body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({min:3}).withMessage('Name must be at least 3 characters long'),
        body('specialty')
        .trim()
        .notEmpty().withMessage('Specialty is required')
        .isLength({min:3}).withMessage('Specialty must be at least 3 characters long'),
    ];
    router.get('/',doctorsController.getDoctors);
    router.get('/specialty/:specialty',doctorsController.getDoctorBySpecialty);
    router.get('/:id',doctorsController.getDoctorById);
    
router.post('/',authMiddleware,checkRole(['admin']),doctorValidationRules,validationMiddleware,doctorsController.createDoctor);
router.put('/:id',authMiddleware,checkRole(['admin']),doctorValidationRules,validationMiddleware,doctorsController.updateDoctor); 
router.delete('/:id',authMiddleware,checkRole(['admin']),doctorsController.deleteDoctor);

module.exports=router;
