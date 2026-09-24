const express =require('express');
const router= express.Router();
const{authenticateToken} =require('../middlewares/authMiddleware');
const checkrole=require('../middlewares/roleMiddleware');
const validationMiddleware=require('../middlewares/validationMiddleware');
const patientsController=require('../controllers/patientsController');
const{updatePatientValidator,createPatientValidator}=require('../validator/patientValidator');

router.get('/',authenticateToken,checkrole(['admin','doctor']),patientsController.getPatients);
router.get('/:id',authenticateToken,checkrole(['admin','doctor']),patientsController.getPatientById);

router.post('/',authenticateToken,checkrole(['admin']),createPatientValidator,validationMiddleware,patientsController.createPatient);
router.put('/:id',authenticateToken,checkrole(['admin']),updatePatientValidator,validationMiddleware,
patientsController.updatePatient);
router.delete('/:id',authenticateToken,checkrole(['admin']),patientsController.deletePatient);
module.exports=router;

