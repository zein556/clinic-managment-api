const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const validationMiddleware = require('../middlewares/validationMiddleware');
const doctorsController = require('../controllers/doctorsController');
const checkRole = require('../middlewares/roleMiddleware');
const { createDoctorValidator, updateDoctorValidator } = require('../validator/doctorValidator');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor Information And Record Managment 
 */

/**
 * @swagger
 * /doctors:
 *   get:
 *     summary: Retrieve List of all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of Available Doctors Retrieved Successfully
 */
router.get('/', doctorsController.getDoctors);

/**
 * @swagger
 * /doctors/{id}:
 *   get:
 *     summary: Get Doctor Details By ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor Details Retrieved Successfully
 *       404:
 *         description: Doctor Not Found
 */
router.get('/:id', doctorsController.getDoctorById);

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Create a New Doctor (Admin Only)
 *     tags: [Doctors]
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
 *               - specialty
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dr.Zein"
 *               specialty:
 *                 type: string
 *                 example: "Cardiology"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       201:
 *         description: Doctor Created Successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', authenticateToken, checkRole(['admin']), createDoctorValidator, validationMiddleware, doctorsController.createDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   put:
 *     summary: Update Doctor Details
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Doctor Updated Successfully
 *       404:
 *         description: Doctor Not Found
 */
router.put('/:id', authenticateToken, checkRole(['admin']), updateDoctorValidator, validationMiddleware, doctorsController.updateDoctor);

/**
 * @swagger
 * /doctors/{id}:
 *   delete:
 *     summary: Delete a Doctor (Admin Only)
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor Deleted Successfully
 *       404:
 *         description: Doctor Not Found
 */
router.delete('/:id', authenticateToken, checkRole(['admin']), doctorsController.deleteDoctor);

module.exports = router;