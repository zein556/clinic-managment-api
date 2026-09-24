const express=require('express');
const {authenticateToken} = require('../middlewares/authMiddleware');
const router=express.Router();
const validationMiddleware=require('../middlewares/validationMiddleware');
const doctorsController=require('../controllers/doctorsController');
   const checkRole =require('../middlewares/roleMiddleware');
   const {createDoctorValidator,updateDoctorValidator}=require('../validator/doctorValidator');
    
    router.get('/',doctorsController.getDoctors);
    router.get('/:id',doctorsController.getDoctorById);
    
router.post('/',authenticateToken,checkRole(['admin']),createDoctorValidator,validationMiddleware,doctorsController.createDoctor);
router.put('/:id',authenticateToken,checkRole(['admin']),updateDoctorValidator,validationMiddleware,doctorsController.updateDoctor); 
router.delete('/:id',authenticateToken,checkRole(['admin']),doctorsController.deleteDoctor);

module.exports=router;
