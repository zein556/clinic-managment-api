const request = require('supertest');

jest.mock('../models/userModel');
jest.mock('../models/doctorModel');
jest.mock('../models/patientModel');

const userModel = require('../models/userModel');
const doctorModel = require('../models/doctorModel');
const patientModel = require('../models/patientModel');

const app = require('../server');

describe('Auth API', () => {

    test('POST /auth/register should reject invalid email', async () => {

        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'Test User',
                email: 'invalid-email',
                password: '123456'
            });

        expect(response.statusCode).toBe(400);
    });


    test('POST /auth/register should register a patient successfully', async () => {

        userModel.findUserByEmail.mockResolvedValue(null);

        userModel.createUser.mockResolvedValue({
            id: 100,
            email: 'test@example.com',
            role: 'patient'
        });

        patientModel.createPatient.mockResolvedValue({
            id: 50,
            name: 'Test User',
            user_id: 100
        });

        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'Test User',
                email: 'test@example.com',
                password: '123456'
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.message).toBe('User registered successfully');

        expect(response.body.user).toEqual({
            id: 100,
            email: 'test@example.com',
            role: 'patient'
        });

        expect(userModel.findUserByEmail)
            .toHaveBeenCalledWith('test@example.com');

        expect(userModel.createUser)
            .toHaveBeenCalled();

        expect(patientModel.createPatient)
            .toHaveBeenCalled();
    });

});