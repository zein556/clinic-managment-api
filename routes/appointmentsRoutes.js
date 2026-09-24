const express=require('express')
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
}=require('../controllers/appointmentsController');
const {authenticateToken}=require('../middlewares/authMiddleware');
const checkRole=require('../middlewares/roleMiddleware');
const {validateUpdateAppointment}=require('../validator/appointmentValidator');
router.post('/',authenticateToken,checkRole(['patient']),createAppointment);
router.get('/',authenticateToken,getAppointments);
router.get('/:id',authenticateToken,getAppointmentById);
router.put('/:id',authenticateToken,validateUpdateAppointment,updateAppointment);
router.delete('/:id',authenticateToken,deleteAppointment);
module.exports=router;