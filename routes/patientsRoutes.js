const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const checkrole = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');
const patientsController = require('../controllers/patientsController');

const {
    updatePatientValidator,
    updateMyProfileValidator,
    createPatientValidator
} = require('../validator/patientValidator');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management endpoints
 */

// Patient's own profile - must be before /:id
/**
 * @swagger
 * /patients/me:
 *   get:
 *     summary: Get the logged-in patient's own profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Patient access only
 *       404:
 *         description: Patient profile not found
 */
router.get(
    '/me',
    authenticateToken,
    checkrole(['patient']),
    patientsController.getMyProfile
);

/**
 * @swagger
 * /patients/me:
 *   put:
 *     summary: Update the logged-in patient's own profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile updated successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Patient access only
 */
router.put(
    '/me',
    authenticateToken,
    checkrole(['patient']),
    updateMyProfileValidator,
    validationMiddleware,
    patientsController.updateMyProfile
);

// Admin and Doctor: Get all patients
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
 */
router.get(
    '/',
    authenticateToken,
    checkrole(['admin', 'doctor']),
    patientsController.getPatients
);

// Admin and Doctor: Get patient by ID
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
 *     responses:
 *       200:
 *         description: Patient details retrieved successfully
 *       404:
 *         description: Patient not found
 */
router.get(
    '/:id',
    authenticateToken,
    checkrole(['admin', 'doctor']),
    patientsController.getPatientById
);

// Admin: Create patient
/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create a new patient (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticateToken,
    checkrole(['admin']),
    createPatientValidator,
    validationMiddleware,
    patientsController.createPatient
);

// Admin: Update patient by ID
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
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *       404:
 *         description: Patient not found
 */
router.put(
    '/:id',
    authenticateToken,
    checkrole(['admin']),
    updatePatientValidator,
    validationMiddleware,
    patientsController.updatePatient
);

// Admin: Deactivate patient account
/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Deactivate a patient account (Admin only)
 *     description: Deactivates the account without deleting patient data.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/:id',
    authenticateToken,
    checkrole(['admin']),
    patientsController.deactivatePatient
);

// Admin: Reactivate patient account
/**
 * @swagger
 * /patients/{id}/activate:
 *   patch:
 *     summary: Reactivate a patient account (Admin only)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
    '/:id/activate',
    authenticateToken,
    checkrole(['admin']),
    patientsController.activatePatient
);

module.exports = router;
