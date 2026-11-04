const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
jest.mock('../models/userModel');
jest.mock('../models/doctorModel');
jest.mock('../models/patientModel');
const userModel = require('../models/userModel');
const doctorModel = require('../models/doctorModel');
const patientModel = require('../models/patientModel');
const app = require('../server');
describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
test('allows the local frontend to submit registration requests', async () => {
    const response = await request(app)
        .options('/auth/register')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'content-type');

    expect(response.headers['access-control-allow-origin'])
        .toBe('http://localhost:5173');
});
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
    test('POST /auth/login should reject deactivated users', async () => {
        const hashedPassword = await bcrypt.hash('123456', 10);
        userModel.findUserByEmail.mockResolvedValue({
            id: 200,
            email: 'inactive@example.com',
            password: hashedPassword,
            role: 'patient',
            isActive: false,
            patient: null,
            doctor: null
        });
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: 'inactive@example.com',
                password: '123456'
            });
        expect(response.statusCode).toBe(403);
        expect(response.body.error)
            .toBe('Your account has been deactivated. Please contact the administrator.');
    });
    test('protected routes should reject tokens belonging to deactivated users', async () => {
        const token = jwt.sign(
            {
                id: 200,
                email: 'inactive@example.com',
                role: 'admin',
                profileId: null
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        userModel.findUserById.mockResolvedValue({
            id: 200,
            email: 'inactive@example.com',
            role: 'admin',
            isActive: false
        });
        const response = await request(app)
            .get('/patients')
            .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.error)
            .toBe('Your account has been deactivated');
        expect(userModel.findUserById)
            .toHaveBeenCalledWith(200);
    });
});
