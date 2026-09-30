const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentsController');

const { authenticateToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { validateUpdateAppointment } = require('../validator/appointmentValidator');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management endpoints
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctorId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date-time
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment Created Successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing
 */
router.post('/', authenticateToken, checkRole(['patient']), createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Retrieve all appointments
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Appointments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get Appointment details by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details retrieved successfully
 *       404:
 *         description: Appointment Not Found
 */
router.get('/:id', authenticateToken, getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Updated an existing appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment Updated Successfully
 *       400:
 *         description: Invalid parameters
 */
router.put('/:id', authenticateToken, validateUpdateAppointment, updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment Deleted Successfully
 *       404:
 *         description: Appointment Not Found
 */
router.delete('/:id', authenticateToken, deleteAppointment);

module.exports = router;