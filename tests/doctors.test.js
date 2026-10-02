const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/userModel');
jest.mock('../models/doctorModel');

const userModel = require('../models/userModel');
const doctorModel = require('../models/doctorModel');

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

describe('Doctors API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /doctors - get all doctors', async () => {
        doctorModel.findAllDoctors.mockResolvedValue([
            {
                id: 1,
                name: 'Dr. Zein',
                specialty: 'Cardiology',
                phone: '123456789',
                user_id: 10
            },
            {
                id: 2,
                name: 'Dr. Ahmad',
                specialty: 'Dentistry',
                phone: '987654321',
                user_id: 11
            }
        ]);

        const response = await request(app)
            .get('/doctors');

        expect(response.statusCode).toBe(200);
        expect(response.body.doctors).toHaveLength(2);
        expect(response.body.doctors[0].name).toBe('Dr. Zein');

        expect(doctorModel.findAllDoctors)
            .toHaveBeenCalled();
    });


    test('GET /doctors/:id - get doctor by ID', async () => {
        doctorModel.findDoctorById.mockResolvedValue({
            id: 1,
            name: 'Dr. Zein',
            specialty: 'Cardiology',
            phone: '123456789',
            user_id: 10
        });

        const response = await request(app)
            .get('/doctors/1');

        expect(response.statusCode).toBe(200);
        expect(response.body.doctor.id).toBe(1);
        expect(response.body.doctor.name).toBe('Dr. Zein');

        expect(doctorModel.findDoctorById)
            .toHaveBeenCalledWith(1);
    });


    test('GET /doctors/:id - doctor not found', async () => {
        doctorModel.findDoctorById.mockResolvedValue(null);

        const response = await request(app)
            .get('/doctors/999');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Doctor not found');

        expect(doctorModel.findDoctorById)
            .toHaveBeenCalledWith(999);
    });


    test('POST /doctors - create doctor', async () => {
        userModel.findUserByEmail.mockResolvedValue(null);

        userModel.createUser.mockResolvedValue({
            id: 20,
            email: 'doctor@example.com',
            role: 'doctor'
        });

        doctorModel.createDoctor.mockResolvedValue({
            id: 5,
            name: 'Dr. Zein',
            specialty: 'Cardiology',
            phone: '123456789',
            user_id: 20
        });

        const response = await request(app)
            .post('/doctors')
            .set('Authorization', `Bearer ${createToken('admin')}`)
            .send({
                username: 'Dr. Zein',
                specialty: 'Cardiology',
                phone: '123456789',
                email: 'doctor@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message)
            .toBe('Doctor created successfully');

        expect(response.body.doctor.id).toBe(5);
        expect(response.body.doctor.name).toBe('Dr. Zein');

        expect(userModel.findUserByEmail)
            .toHaveBeenCalledWith('doctor@example.com');

        expect(userModel.createUser)
            .toHaveBeenCalled();

        expect(doctorModel.createDoctor)
            .toHaveBeenCalled();
    });


    test('POST /doctors - email already exists', async () => {
        userModel.findUserByEmail.mockResolvedValue({
            id: 20,
            email: 'doctor@example.com',
            role: 'doctor'
        });
        const response = await request(app)
            .post('/doctors')
            .set('Authorization', `Bearer ${createToken('admin')}`)
            .send({
                username: 'Dr. Zein',
                specialty: 'Cardiology',
                phone: '123456789',
                email: 'doctor@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error)
            .toBe('Email already exists');

        expect(userModel.createUser)
            .not.toHaveBeenCalled();

        expect(doctorModel.createDoctor)
            .not.toHaveBeenCalled();
    });


    test('PUT /doctors/:id - update doctor', async () => {
        doctorModel.updateDoctor.mockResolvedValue({
            id: 1,
            name: 'Dr. Updated',
            specialty: 'Neurology',
            phone: '555555555',
            user_id: 10
        });

        const response = await request(app)
            .put('/doctors/1')
            .set('Authorization', `Bearer ${createToken('admin')}`)
            .send({
                username: 'Dr. Updated',
                specialty: 'Neurology',
                phone: '555555555'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message)
            .toBe('Doctor profile updated');

        expect(response.body.doctor.id).toBe(1);

        expect(doctorModel.updateDoctor)
            .toHaveBeenCalledWith(
                '1',
                expect.objectContaining({
                    username: 'Dr. Updated',
                    specialty: 'Neurology',
                    phone: '555555555'
                })
            );
    });


    test('DELETE /doctors/:id - delete doctor', async () => {
        doctorModel.findDoctorById.mockResolvedValue({
            id: 1,
            name: 'Dr. Zein',
            specialty: 'Cardiology',
            phone: '123456789',
            user_id: 10
        });

        doctorModel.deleteDoctor.mockResolvedValue({
            id: 1
        });

        const response = await request(app)
            .delete('/doctors/1')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message)
            .toBe('Doctor deleted successfully');

        expect(doctorModel.findDoctorById)
            .toHaveBeenCalledWith('1');

        expect(doctorModel.deleteDoctor)
            .toHaveBeenCalledWith('1');
    });


    test('DELETE /doctors/:id - doctor not found', async () => {
        doctorModel.findDoctorById.mockResolvedValue(null);

        const response = await request(app)
            .delete('/doctors/999')
            .set('Authorization', `Bearer ${createToken('admin')}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.error)
            .toBe('Doctor not found');

        expect(doctorModel.deleteDoctor)
            .not.toHaveBeenCalled();
    });


    test('POST /doctors - doctor role is forbidden', async () => {
        const response = await request(app)
            .post('/doctors')
            .set('Authorization', `Bearer ${createToken('doctor')}`)
            .send({
                username: 'Dr. Test',
                specialty: 'Cardiology',
                phone: '123456789',
                email: 'test@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(403);

        expect(userModel.createUser)
            .not.toHaveBeenCalled();

        expect(doctorModel.createDoctor)
            .not.toHaveBeenCalled();
    });


    test('PUT /doctors/:id - doctor role is forbidden', async () => {
        const response = await request(app)
            .put('/doctors/1')
            .set('Authorization', `Bearer ${createToken('doctor')}`)
            .send({
                username: 'Updated Doctor',
                specialty: 'Neurology'
            });

        expect(response.statusCode).toBe(403);
        expect(doctorModel.updateDoctor)
            .not.toHaveBeenCalled();
    });


    test('DELETE /doctors/:id - doctor role is forbidden', async () => {
        const response = await request(app)
            .delete('/doctors/1')
            .set('Authorization', `Bearer ${createToken('doctor')}`);

        expect(response.statusCode).toBe(403);

        expect(doctorModel.deleteDoctor)
            .not.toHaveBeenCalled();
    });


    test('POST /doctors - no token', async () => {
        const response = await request(app)
            .post('/doctors')
            .send({
                username: 'Dr. Test',
                specialty: 'Cardiology',
                phone: '123456789',
                email: 'test@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(401);

        expect(userModel.createUser)
            .not.toHaveBeenCalled();
    });

});