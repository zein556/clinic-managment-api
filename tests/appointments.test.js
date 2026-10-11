const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/appointmentsModel');
jest.mock('../models/NotificationModel');

const AppointmentModel = require('../models/appointmentsModel');
const notificationModel = require('../models/NotificationModel');

const app = require('../server');

const createToken = (role, profileId = 1) => {
    return jwt.sign(
        {
            id: 1,
            email: `${role}@test.com`,
            role,
            profileId
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

describe('Appointments API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // POST /appointments
    test('patient can create an appointment and notifications are created', async () => {

        AppointmentModel.findConflict.mockResolvedValue(null);

        AppointmentModel.createAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            appointment_date: new Date('2026-10-05'),
            appointment_time: '10:40:00',
            status: 'pending'
        });

        notificationModel.createNotificationForDoctor.mockResolvedValue({
            id: 1,
            user_id: 20,
            title: 'New Appointment',
            message: 'A new appointment has been booked with you.',
            type: 'appointment_created',
            is_read: false
        });

        notificationModel.createNotificationForPatient.mockResolvedValue({
            id: 2,
            user_id: 30,
            title: 'Appointment Booked',
            message: 'Your appointment has been booked successfully.',
            type: 'appointment_created',
            is_read: false
        });

        const res = await request(app)
            .post('/appointments')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            )
            .send({
                doctor_id: 2,
                appointment_date: '2026-10-05',
                appointment_time: '10:40'
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.message)
            .toBe('Appointment booked successfully');

        // Check doctor notification
        expect(notificationModel.createNotificationForDoctor)
            .toHaveBeenCalledWith(
                2,
                'New Appointment',
                'A new appointment has been booked with you.',
                'appointment_created'
            );

        // Check patient notification
        expect(notificationModel.createNotificationForPatient)
            .toHaveBeenCalledWith(
                1,
                'Appointment Booked',
                'Your appointment has been booked successfully.',
                'appointment_created'
            );
    });


    test('cannot create appointment when doctor is already booked', async () => {

        AppointmentModel.findConflict.mockResolvedValue({
            id: 5
        });

        const res = await request(app)
            .post('/appointments')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            )
            .send({
                doctor_id: 2,
                appointment_date: '2026-10-05',
                appointment_time: '10:40'
            });

        expect(res.statusCode).toBe(400);

        expect(res.body.error)
            .toBe('Doctor is already booked at this time!');

        // No notifications should be created
        expect(notificationModel.createNotificationForDoctor)
            .not.toHaveBeenCalled();

        expect(notificationModel.createNotificationForPatient)
            .not.toHaveBeenCalled();
    });


    // GET /appointments
    test('patient can get their appointments', async () => {

        AppointmentModel.findAllAppointments.mockResolvedValue([
            {
                id: 1,
                doctor_id: 2,
                patient_id: 1,
                status: 'pending'
            }
        ]);
        const res = await request(app)
            .get('/appointments')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveLength(1);
    });


    test('returns 404 when no appointments exist', async () => {

        AppointmentModel.findAllAppointments.mockResolvedValue([]);

        const res = await request(app)
            .get('/appointments')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(404);

        expect(res.body.error)
            .toBe('No appointments found');
    });


    // GET /appointments/:id
    test('user can get their own appointment', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'pending'
        });

        const res = await request(app)
            .get('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(200);

        expect(res.body.appointment.id).toBe(1);
    });


    test('cannot get another patient appointment', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 5,
            status: 'pending'
        });

        const res = await request(app)
            .get('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(403);
    });


    // PUT /appointments/:id
    test('patient can update their appointment time', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            appointment_date: new Date('2026-10-05'),
            appointment_time: '10:40',
            status: 'pending'
        });

        AppointmentModel.findConflictForUpdate.mockResolvedValue(null);

        AppointmentModel.updateAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            appointment_time: '12:00',
            status: 'pending'
        });

        const res = await request(app)
            .put('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            )
            .send({
                appointment_time: '12:00'
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.message)
            .toBe('Appointment updated successfully');

        // Changing time should NOT create a status notification
        expect(notificationModel.createNotificationForPatient)
            .not.toHaveBeenCalled();
    });


    test('doctor can confirm appointment and patient receives notification', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'pending'
        });

        AppointmentModel.updateAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'confirmed'
        });

        notificationModel.createNotificationForPatient.mockResolvedValue({
            id: 10,
            user_id: 1,
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed.',
            type: 'appointment_confirmed',
            is_read: false
        });

        const res = await request(app)
            .put('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('doctor', 2)}`
            )
            .send({
                status: 'confirmed'
            });
            expect(res.statusCode).toBe(200);

        expect(notificationModel.createNotificationForPatient)
            .toHaveBeenCalledWith(
                1,
                'Appointment Confirmed',
                'Your appointment has been confirmed.',
                'appointment_confirmed'
            );
    });


    test('doctor can cancel appointment and patient receives notification', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'pending'
        });

        AppointmentModel.updateAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'cancelled'
        });

        notificationModel.createNotificationForPatient.mockResolvedValue({
            id: 11,
            user_id: 1,
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled.',
            type: 'appointment_cancelled',
            is_read: false
        });

        const res = await request(app)
            .put('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('doctor', 2)}`
            )
            .send({
                status: 'cancelled'
            });

        expect(res.statusCode).toBe(200);

        expect(notificationModel.createNotificationForPatient)
            .toHaveBeenCalledWith(
                1,
                'Appointment Cancelled',
                'Your appointment has been cancelled.',
                'appointment_cancelled'
            );
    });


    test('doctor can complete appointment and patient receives notification', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'confirmed'
        });

        AppointmentModel.updateAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            status: 'completed'
        });

        notificationModel.createNotificationForPatient.mockResolvedValue({
            id: 12,
            user_id: 1,
            title: 'Appointment Completed',
            message: 'Your appointment has been completed.',
            type: 'appointment_completed',
            is_read: false
        });

        const res = await request(app)
            .put('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('doctor', 2)}`
            )
            .send({
                status: 'completed'
            });

        expect(res.statusCode).toBe(200);

        expect(notificationModel.createNotificationForPatient)
            .toHaveBeenCalledWith(
                1,
                'Appointment Completed',
                'Your appointment has been completed.',
                'appointment_completed'
            );
    });


    // DELETE /appointments/:id
    test('patient can delete their appointment', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1
        });

        AppointmentModel.deleteAppointment.mockResolvedValue({
            id: 1
        });

        const res = await request(app)
            .delete('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(200);

        expect(res.body.message)
            .toBe('Appointment deleted successfully');
    });


    test('cannot delete another patient appointment', async () => {

        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 5
        });
        const res = await request(app)
            .delete('/appointments/1')
            .set(
                'Authorization',
                `Bearer ${createToken('patient', 1)}`
            );

        expect(res.statusCode).toBe(403);
    });


    test('cannot access appointments without token', async () => {

        const res = await request(app)
            .get('/appointments');

        expect(res.statusCode).toBe(401);
    });

});