const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../models/medicalRecordModel');

const medicalRecordModel = require('../models/medicalRecordModel');
const app = require('../server');

const createToken = (role, userId = 1) => {
    return jwt.sign(
        {
            id: userId,
            email: `${role}@test.com`,
            role
        },
        process.env.JWT_SECRET || 'secretkey',
        { expiresIn: '1h' }
    );
};

describe('Medical Records API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------
    // 1. POST /medicalRecords - Create Record
    // -------------------------------------------------------------
    describe('POST /medicalRecords', () => {

        test('should create medical record successfully when user is doctor', async () => {
            medicalRecordModel.findAppointmentWithDoctor.mockResolvedValue({
                id: 5,
                doctor_id: 10,
                patient_id: 2
            });

            medicalRecordModel.findDoctorByUserId.mockResolvedValue({
                id: 10,
                user_id: 1
            });

            medicalRecordModel.createRecord.mockResolvedValue({
                id: 1,
                appointment_id: 5,
                patient_id: 2,
                doctor_id: 10,
                diagnosis: 'Acute Pharyngitis',
                notes: 'Prescribed rest'
            });

            const response = await request(app)
                .post('/medicalRecords')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`)
                .send({
                    appointment_id: 5,
                    diagnosis: 'Acute Pharyngitis',
                    notes: 'Prescribed rest'
                });

            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Medical record created successfully');
            expect(response.body.data.id).toBe(1);

            expect(medicalRecordModel.findAppointmentWithDoctor).toHaveBeenCalledWith(5);
            expect(medicalRecordModel.findDoctorByUserId).toHaveBeenCalledWith(1);
            expect(medicalRecordModel.createRecord).toHaveBeenCalled();
        });

        test('should return 404 if appointment is not found', async () => {
            medicalRecordModel.findAppointmentWithDoctor.mockResolvedValue(null);

            const response = await request(app)
                .post('/medicalRecords')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`)
                .send({
                    appointment_id: 999,
                    diagnosis: 'Flu'
                });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Appointment not found');
            expect(medicalRecordModel.createRecord).not.toHaveBeenCalled();
        });

        test('should return 403 if doctor is not assigned to this appointment', async () => {
            medicalRecordModel.findAppointmentWithDoctor.mockResolvedValue({
                id: 5,
                doctor_id: 99, 
                patient_id: 2
            });

            medicalRecordModel.findDoctorByUserId.mockResolvedValue({
                id: 10, // الطبيب الذي يجري الطلب
                user_id: 1
            });

            const response = await request(app)
                .post('/medicalRecords')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`)
                .send({
                    appointment_id: 5,
                    diagnosis: 'Flu'
                });

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe('Unauthorized to add record for this appointment');
            expect(medicalRecordModel.createRecord).not.toHaveBeenCalled();
        });
        test('should return 403 when patient tries to create a record', async () => {
            const response = await request(app)
                .post('/medicalRecords')
                .set('Authorization', `Bearer ${createToken('patient', 1)}`)
                .send({
                    appointment_id: 5,
                    diagnosis: 'Self diagnosis'
                });

            expect(response.statusCode).toBe(403);
            expect(medicalRecordModel.createRecord).not.toHaveBeenCalled();
        });

        test('should return 401 when no token is provided', async () => {
            const response = await request(app)
                .post('/medicalRecords')
                .send({
                    appointment_id: 5,
                    diagnosis: 'Flu'
                });

            expect(response.statusCode).toBe(401);
            expect(medicalRecordModel.createRecord).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------
    // 2. GET /medicalRecords/patient/:patient_id - Get Patient History
    // -------------------------------------------------------------
    describe('GET /medicalRecords/patient/:patient_id', () => {

        test('should return patient history for doctor or admin', async () => {
            medicalRecordModel.getPatientHistory.mockResolvedValue([
                { id: 1, diagnosis: 'Flu', patient_id: 2 },
                { id: 2, diagnosis: 'Cold', patient_id: 2 }
            ]);

            const response = await request(app)
                .get('/medicalRecords/patient/2')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(medicalRecordModel.getPatientHistory).toHaveBeenCalledWith('2');
        });

        test('should return 403 if patient tries to access another patient history', async () => {
            medicalRecordModel.findPatientByUserId.mockResolvedValue({
                id: 1, // المريض الحقيقي صاحب الحساب
                user_id: 1
            });

            const response = await request(app)
                .get('/medicalRecords/patient/99') // يحاول الوصول لسجل مريض آخر رقم 99
                .set('Authorization', `Bearer ${createToken('patient', 1)}`);

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe('Access denied to this record history');
            expect(medicalRecordModel.getPatientHistory).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------
    // 3. GET /medicalRecords/appointment/:appointment_id
    // -------------------------------------------------------------
    describe('GET /medicalRecords/appointment/:appointment_id', () => {

        test('should return record by appointment ID', async () => {
            medicalRecordModel.getRecordByAppointmentId.mockResolvedValue({
                id: 1,
                appointment_id: 5,
                diagnosis: 'Acute Pharyngitis'
            });

            const response = await request(app)
                .get('/medicalRecords/appointment/5')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.data.id).toBe(1);
            expect(medicalRecordModel.getRecordByAppointmentId).toHaveBeenCalledWith('5');
        });

        test('should return 404 if record for appointment is not found', async () => {
            medicalRecordModel.getRecordByAppointmentId.mockResolvedValue(null);

            const response = await request(app)
                .get('/medicalRecords/appointment/999')
                .set('Authorization', `Bearer ${createToken('doctor', 1)}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Medical record not found for this appointment');
        });
    });

});