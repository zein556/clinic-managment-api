const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validationMiddleware = require('../middlewares/validationMiddleware');
const { validateRegisterUser, validateLoginUser } = require('../validator/authValidator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user account management
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               role:
 *                 type: string
 *                 example: patient
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use or validation error
 */
router.post(
  '/register',
  validateRegisterUser,
  validationMiddleware,
  authController.register
);

router.post('/register', validateRegisterUser, validationMiddleware, authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User Login to receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password@123!"
 *     responses:
 *       200:
 *         description: Login Successful,returns authentication token
 *       401:
 *         description: Invalid Credentials
 */
router.post('/login', validateLoginUser, validationMiddleware, authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout User
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out Successfully
 */
router.post('/logout', authController.logout);

module.exports = router;