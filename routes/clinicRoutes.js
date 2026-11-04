const express = require('express');
const router = express.Router();

const {
    getClinic,
    updateClinic
} = require('../controllers/clinicController');

const { authenticateToken } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Clinic
 *   description: Clinic information and management
 */

/**
 * @swagger
 * /clinic:
 *   get:
 *     summary: Get clinic information
 *     tags: [Clinic]
 *     responses:
 *       200:
 *         description: Clinic information retrieved successfully
 *       404:
 *         description: Clinic not found
 *
 *   put:
 *     summary: Update clinic information (Admin only)
 *     tags: [Clinic]
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
 *               - address
 *               - latitude
 *               - longitude
 *             properties:
 *               name:
 *                 type: string
 *                 example: عيادة دوار الزراعة
 *               address:
 *                 type: string
 *                 example: دوار الزراعة، اللاذقية، سوريا
 *               latitude:
 *                 type: number
 *                 example: 35.52526
 *               longitude:
 *                 type: number
 *                 example: 35.79689
 *     responses:
 *       200:
 *         description: Clinic updated successfully
 *       400:
 *         description: Invalid clinic information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Clinic not found
 */

router.get('/', getClinic);

router.put(
    '/',
    authenticateToken,
    checkRole(['admin']),
    updateClinic
);

module.exports = router;