const express=require('express')
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
}=require('../controllers/appointmentsController');
const {authenticateToken,authorizeRoles}=require('../middleware/authMiddleware');
const {validateUpdateAppointment}=require('../validator/appointmentValidator');
router.post('/',authenticateToken,authorizeRoles('patient'),createAppointment);
router.get('/',authenticateToken,getAppointments);
router.get('/:id',authenticateToken,getAppointmentById);
router.put('/:id',authenticateToken,validateUpdateAppointment,updateAppointment);
router.delete('/:id',authenticateToken,deleteAppointment);