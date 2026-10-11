const express = require('express');
const router = express.Router();

const { getClinic } = require('../controllers/clinicController');

/**
 * @swagger
 * tags:
 *   name: Clinic
 *   description: Clinic information and location
 */

/**
 * @swagger
 * /clinic:
 *   get:
 *     summary: Get clinic information and location
 *     description: Returns clinic details, its doctors, and a Google Maps link to the clinic location.
 *     tags: [Clinic]
 *     responses:
 *       200:
 *         description: Clinic information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: العيادة الرئيسية
 *                 address:
 *                   type: string
 *                   example: عنوان العيادة
 *                 latitude:
 *                   type: number
 *                   example: 35.52526
 *                 longitude:
 *                   type: number
 *                   example: 35.79689
 *                 googleMapsUrl:
 *                   type: string
 *                   format: uri
 *                   description: Google Maps link for the clinic location
 *                   example: https://www.google.com/maps/search/?api=1&query=35.52526,35.79689
 *                 doctors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       specialty:
 *                         type: string
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 */
router.get('/', getClinic);

module.exports = router;
