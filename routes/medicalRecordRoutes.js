const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { createRecordValidation, getPatientHistoryValidation } = require('../validator/medicalRecordValidator');
const validate = require('../middlewares/validationMiddleware');
const { authenticateToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Medical Records
 *   description: Medical records and patient history operations
 */

/**
 * @swagger
 * /medicalRecords:
 *   post:
 *     summary: Create a medical record (Doctor and Admin only)
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - appointment_id
 *               - diagnosis
 *             properties:
 *               patient_id:
 *                 type: integer
 *                 example: 1
 *               appointment_id:
 *                 type: integer
 *                 example: 5
 *               diagnosis:
 *                 type: string
 *                 example: "Acute Pharyngitis"
 *               notes:
 *                 type: string
 *                 example: "Prescribed 3 days rest and medication"
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.post('/', authenticateToken, checkRole(['doctor', 'admin']), createRecordValidation, validate, medicalRecordController.createRecord);

/**
 * @swagger
 * /medicalRecords/patient/{patient_id}:
 *   get:
 *     summary: Retrieve full medical history for a specific patient
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient medical history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient records not found
 */
router.get('/patient/:patient_id', authenticateToken, getPatientHistoryValidation, validate, medicalRecordController.getPatientHistory);

/**
 * @swagger
 * /medicalRecords/appointment/{appointment_id}:
 *   get:
 *     summary: Get medical record associated with an appointment
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Medical record details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found for this appointment
 */
router.get('/appointment/:appointment_id', authenticateToken, medicalRecordController.getRecordByAppointment);

module.exports = router;