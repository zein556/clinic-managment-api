const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/appointmentsModel');

const AppointmentModel = require('../models/appointmentsModel');

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
    test('patient can create an appointment', async () => {
        AppointmentModel.findConflict.mockResolvedValue(null);

        AppointmentModel.createAppointment.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 1,
            appointment_date: new Date('2026-10-05'),
            appointment_time: '10:40:00',
            status: 'pending'
        });

        const res = await request(app)
            .post('/appointments')
            .set('Authorization', `Bearer ${createToken('patient', 1)}`)
            .send({
                doctor_id: 2,
                appointment_date: '2026-10-05',
                appointment_time: '10:40'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Appointment booked successfully');
    });

    test('cannot create appointment when doctor is already booked', async () => {
        AppointmentModel.findConflict.mockResolvedValue({ id: 5 });

        const res = await request(app)
            .post('/appointments')
            .set('Authorization', `Bearer ${createToken('patient', 1)}`)
            .send({
                doctor_id: 2,
                appointment_date: '2026-10-05',
                appointment_time: '10:40'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Doctor is already booked at this time!');
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
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test('returns 404 when no appointments exist', async () => {
        AppointmentModel.findAllAppointments.mockResolvedValue([]);

        const res = await request(app)
            .get('/appointments')
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('No appointments found');
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
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

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
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

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
            .set('Authorization', `Bearer ${createToken('patient', 1)}`)
            .send({
                appointment_time: '12:00'
            });
  

     
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Appointment updated successfully');
    });

    test('doctor can update appointment status', async () => {
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

        const res = await request(app)
            .put('/appointments/1')
            .set('Authorization', `Bearer ${createToken('doctor', 2)}`)
            .send({
                status: 'confirmed'
            });

        expect(res.statusCode).toBe(200);
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
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Appointment deleted successfully');
    });

    test('cannot delete another patient appointment', async () => {
        AppointmentModel.findAppointmentById.mockResolvedValue({
            id: 1,
            doctor_id: 2,
            patient_id: 5
        });

        const res = await request(app)
            .delete('/appointments/1')
            .set('Authorization', `Bearer ${createToken('patient', 1)}`);

        expect(res.statusCode).toBe(403);
    });

    test('cannot access appointments without token', async () => {
        const res = await request(app)
            .get('/appointments');

        expect(res.statusCode).toBe(401);
    });
});