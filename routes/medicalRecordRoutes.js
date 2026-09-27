const express =require('express');
const router=express.Router();
const medicalRecordController=require('../controllers/medicalRecordController');
const {createRecordValidation,getPatientHistoryValidation}=require('../validator/medicalRecordValidator');
const validate=require('../middlewares/validationMiddleware');
const {authenticateToken}=require('../middlewares/authMiddleware');
const checkRole=require('../middlewares/roleMiddleware');

// console.log({
// authMiddleware:typeof authMiddleware,
// checkRole:typeof checkRole(['doctor','admin']),
// validate:typeof validate,
// createRecord:typeof medicalRecordController?.createRecord



// });
router.post('/',authenticateToken,checkRole(['doctor','admin']),createRecordValidation,validate,medicalRecordController.createRecord);

router.get('/patient/:patient_id',authenticateToken,getPatientHistoryValidation,validate,medicalRecordController.getPatientHistory);
router.get('/appointment/:appointment_id',authenticateToken,medicalRecordController.getRecordByAppointment);
module.exports =router;