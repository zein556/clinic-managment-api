const express = require('express');
const router = express.Router();

const {
    getNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    markallNotificationsAsRead
} = require('../controllers/notificationController');

const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     description: Returns all notifications belonging to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user notifications
 *       401:
 *         description: Access denied, no token provided
 *       403:
 *         description: Invalid token
 */
router.get('/', authenticateToken, getNotifications);

/**
 * @swagger
 * /notifications/unread:
 *   get:
 *     summary: Get unread notifications
 *     description: Returns all unread notifications belonging to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unread notifications
 *       401:
 *         description: Access denied, no token provided
 *       403:
 *         description: Invalid token
 */
router.get('/unread', authenticateToken, getUnreadNotifications);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     description: Marks one notification as read. The notification must belong to the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Access denied, no token provided
 *       403:
 *         description: Invalid token or access denied
 *       404:
 *         description: Notification not found
 */
router.put('/:id/read', authenticateToken, markNotificationAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications belonging to the authenticated user as read.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Access denied, no token provided
 *       403:
 *         description: Invalid token
 */
router.put('/read-all', authenticateToken, markallNotificationsAsRead);

module.exports = router;
