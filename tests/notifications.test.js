const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/NotificationModel', () => ({
    findNotificationsByUserId: jest.fn(),
    findUnreadNotificationsByUserId: jest.fn(),
    findNotificationById: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn()
}));

const notificationModel = require('../models/NotificationModel');
const app = require('../server');

const createToken = (userId = 1, role = 'patient') => {
    return jwt.sign(
        {
            id: userId,
            email: `${role}@test.com`,
            role,
            profileId: 1
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

describe('Notifications API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /notifications should return user notifications', async () => {

        const token = createToken(1, 'patient');

        const notifications = [
            {
                id: 1,
                user_id: 1,
                title: 'Appointment Confirmed',
                message: 'Your appointment has been confirmed.',
                type: 'appointment_confirmed',
                is_read: false
            }
        ];

        notificationModel.findNotificationsByUserId
            .mockResolvedValue(notifications);

        const response = await request(app)
            .get('/notifications')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.notifications).toEqual(notifications);

        expect(
            notificationModel.findNotificationsByUserId
        ).toHaveBeenCalledWith(1);
    });


    test('GET /notifications/unread should return unread notifications', async () => {

        const token = createToken(1, 'patient');

        const notifications = [
            {
                id: 2,
                user_id: 1,
                title: 'New Prescription',
                message: 'A new prescription has been added to your medical record.',
                type: 'prescription_created',
                is_read: false
            }
        ];

        notificationModel.findUnreadNotificationsByUserId
            .mockResolvedValue(notifications);

        const response = await request(app)
            .get('/notifications/unread')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.notifications).toEqual(notifications);

        expect(
            notificationModel.findUnreadNotificationsByUserId
        ).toHaveBeenCalledWith(1);
    });


    test('PUT /notifications/:id/read should mark notification as read', async () => {

        const token = createToken(1, 'patient');

        const notification = {
            id: 1,
            user_id: 1,
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed.',
            type: 'appointment_confirmed',
            is_read: false
        };

        const updatedNotification = {
            ...notification,
            is_read: true
        };

        notificationModel.findNotificationById
            .mockResolvedValue(notification);

        notificationModel.markNotificationAsRead
            .mockResolvedValue(updatedNotification);

        const response = await request(app)
            .put('/notifications/1/read')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe('Notification marked as read');

        expect(response.body.notification)
            .toEqual(updatedNotification);

        expect(
            notificationModel.findNotificationById
        ).toHaveBeenCalledWith('1');

        expect(
            notificationModel.markNotificationAsRead
        ).toHaveBeenCalledWith('1');
    });


    test('PUT /notifications/:id/read should return 404 if notification does not exist', async () => {

        const token = createToken(1, 'patient');
        notificationModel.findNotificationById
            .mockResolvedValue(null);

        const response = await request(app)
            .put('/notifications/999/read')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(404);

        expect(response.body.error)
            .toBe('Notification not found');

        expect(
            notificationModel.markNotificationAsRead
        ).not.toHaveBeenCalled();
    });


    test('PUT /notifications/:id/read should deny access to another user notification', async () => {

        const token = createToken(1, 'patient');

        const notification = {
            id: 5,
            user_id: 2,
            title: 'Private Notification',
            message: 'This belongs to another user.',
            type: 'test',
            is_read: false
        };

        notificationModel.findNotificationById
            .mockResolvedValue(notification);

        const response = await request(app)
            .put('/notifications/5/read')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);

        expect(response.body.error)
            .toBe('Access denied.You cannot mark this notification as read');

        expect(
            notificationModel.markNotificationAsRead
        ).not.toHaveBeenCalled();
    });


    test('PUT /notifications/read-all should mark all user notifications as read', async () => {

        const token = createToken(1, 'patient');

        notificationModel.markAllNotificationsAsRead
            .mockResolvedValue({
                count: 3
            });

        const response = await request(app)
            .put('/notifications/read-all')
            .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe('All notifications marked as read');

        expect(
            notificationModel.markAllNotificationsAsRead
        ).toHaveBeenCalledWith(1);
    });


    test('GET /notifications should return 401 without token', async () => {

        const response = await request(app)
            .get('/notifications');

        expect(response.statusCode).toBe(401);

        expect(response.body.error)
            .toBe('Access denied, no token provided');
    });

});