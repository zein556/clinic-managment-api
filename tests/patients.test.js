const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel');
jest.mock('../models/patientModel');

const userModel = require('../models/userModel');
const patientModel = require('../models/patientModel');

const app = require('../server');

const createToken = (role) => {
    return jwt.sign(
        {
            id: 1,
            email: `${role}@test.com`,
            role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

describe('Patients API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /patients - create patient', async () => {
        userModel.findUserByEmail.mockResolvedValue(null);

        userModel.createUser.mockResolvedValue({
            id: 200,
            email: 'patient@example.com',
            role: 'patient'
        });

        patientModel.createPatient.mockResolvedValue({
            id: 100,
            name: 'Test Patient',
            phone: '123456789',
            age: 30,
            gender: 'male',
            medical_history: 'None',
            user_id: 200
        });

        const response = await request(app)
            .post('/patients')
            .set('Authorization', `Bearer ${createToken('admin')}`)
            .send({
                username: 'Test Patient',
                phone: '123456789',
                email: 'patient@example.com',
                password: '123456',
                age: 30,
                gender: 'male',
                medical_history: 'None'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Patient created successfully');
        expect(response.body.patient.id).toBe(100);
        expect(userModel.createUser).toHaveBeenCalled();
        expect(patientModel.createPatient).toHaveBeenCalled();
    });

    test('GET /patients - get all patients', async () => {
        patientModel.findAllPatients.mockResolvedValue([
            {
                id: 100,
                name: 'Test Patient',
                phone: '123456789',
                age: 30,
                gender: 'male',
                medical_history: 'None',
                user_id: 200,
                user: {
                    id: 200,
                    email: 'patient@example.com'
                }
            }
        ]);

        const response = await request(app)
            .get('/patients')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.patients).toHaveLength(1);
        expect(response.body.patients[0].id).toBe(100);
        expect(patientModel.findAllPatients).toHaveBeenCalled();
    });

    test('GET /patients/:id - get patient by ID', async () => {
        patientModel.findPatientById.mockResolvedValue({
            id: 100,
            name: 'Test Patient',
            phone: '123456789',
            age: 30,
            gender: 'male',
            medical_history: 'None',
            user_id: 200
        });

        const response = await request(app)
            .get('/patients/100')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.patient.id).toBe(100);
        expect(patientModel.findPatientById)
            .toHaveBeenCalledWith('100');
    });

    test('GET /patients/:id - patient not found', async () => {
        patientModel.findPatientById.mockResolvedValue(null);

        const response = await request(app)
            .get('/patients/999')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Patient Not Found');
    });
    test('PUT /patients/:id - update patient', async () => {
        patientModel.updatePatient.mockResolvedValue({
            id: 100,
            name: 'Updated Patient',
            phone: '555555555',
            age: 31,
            gender: 'male',
            medical_history: 'Updated',
            user_id: 200
        });

        const response = await request(app)
            .put('/patients/100')
            .set('Authorization', `Bearer ${createToken('admin')}`)
            .send({
                name: 'Updated Patient',
                phone: '555555555',
                age: 31,
                gender: 'male',
                medical_history: 'Updated'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Patient updated successfully');
        expect(response.body.patient.id).toBe(100);

        expect(patientModel.updatePatient)
            .toHaveBeenCalledWith(
                '100',
                expect.objectContaining({
                    name: 'Updated Patient'
                })
            );
    });

    test('DELETE /patients/:id - delete patient', async () => {
        patientModel.findPatientById.mockResolvedValue({
            id: 100,
            name: 'Test Patient'
        });

        patientModel.deletePatient.mockResolvedValue({
            id: 100
        });

        const response = await request(app)
            .delete('/patients/100')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Patient deleted successfully');

        expect(patientModel.deletePatient)
            .toHaveBeenCalledWith('100');
    });

    test('DELETE /patients/:id - patient not found', async () => {
        patientModel.findPatientById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/patients/999')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Patient not found');

        expect(patientModel.deletePatient)
            .not.toHaveBeenCalled();
    });

    test('GET /patients - doctor can access', async () => {
        patientModel.findAllPatients.mockResolvedValue([]);

        const response = await request(app)
            .get('/patients')
            .set('Authorization', `Bearer ${createToken('doctor')}`);

        expect(response.statusCode).toBe(200);
    });

    test('POST /patients - doctor is forbidden', async () => {
        const response = await request(app)
            .post('/patients')
            .set('Authorization', `Bearer ${createToken('doctor')}`)
            .send({
                username: 'Test Patient',
                phone: '123456789',
                email: 'patient@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(403);
    });

    test('GET /patients - patient is forbidden', async () => {
        const response = await request(app)
            .get('/patients')
            .set('Authorization', `Bearer ${createToken('patient')}`);

        expect(response.statusCode).toBe(403);
    });

    test('GET /patients - no token', async () => {
        const response = await request(app)
            .get('/patients');

        expect(response.statusCode).toBe(401);
    });
});