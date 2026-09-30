const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const checkrole = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');
const patientsController = require('../controllers/patientsController');
const { updatePatientValidator, createPatientValidator } = require('../validator/patientValidator');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management endpoints
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Retrieve list of all patients (Admin and Doctor only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access restricted to Admin and Doctors
 */
router.get('/', authenticateToken, checkrole(['admin', 'doctor']), patientsController.getPatients);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     summary: Get patient details by ID (Admin and Doctor only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router.get('/:id', authenticateToken, checkrole(['admin', 'doctor']), patientsController.getPatientById);

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               gender:
 *                 type: string
 *                 example: "female"
 *               birth_date:
 *                 type: string
 *                 format: date
 *                 example: "1998-04-12"
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Invalid payload
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, checkrole(['admin']), createPatientValidator, validationMiddleware, patientsController.createPatient);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     summary: Update patient details (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 */
router.put('/:id', authenticateToken, checkrole(['admin']), updatePatientValidator, validationMiddleware, patientsController.updatePatient);/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Delete a patient (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
router.delete('/:id', authenticateToken, checkrole(['admin']), patientsController.deletePatient);

module.exports = router;