
const patientModel = require('../models/patientModel');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');

// Admin: Create a patient account and profile.
const createPatient = async (req, res, next) => {
    try {
        const {
            username,
            phone,
            email,
            password,
            medical_history,
            age,
            gender
        } = req.body;

        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPatient = await patientModel.createPatientWithUser(
            {
                email,
                password: hashedPassword,
                role: 'patient'
            },
            {
                username,
                phone,
                age,
                gender,
                medical_history
            }
        );

        return res.status(201).json({
            message: 'Patient created successfully',
            patient: newPatient
        });

    } catch (err) {
        next(err);
    }
};

// Admin and Doctor: Retrieve all patients.
const getPatients = async (req, res, next) => {
    try {
        const patients = await patientModel.findAllPatients();

        return res.status(200).json({ patients });

    } catch (err) {
        next(err);
    }
};

// Admin and Doctor: Retrieve a patient by ID.
const getPatientById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await patientModel.findPatientById(id);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        return res.status(200).json({ patient });

    } catch (err) {
        next(err);
    }
};

// Patient: Retrieve their own profile.
const getMyProfile = async (req, res, next) => {
    try {
        const patientId = req.user.profileId;

        if (!patientId) {
            return res.status(404).json({
                error: 'Patient profile not found'
            });
        }

        const patient = await patientModel.findPatientById(patientId);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient profile not found'
            });
        }

        return res.status(200).json({
            patient
        });

    } catch (err) {
        next(err);
    }
};

// Admin: Update any patient's personal information.
const updatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const allowedFields = ['username', 'phone', 'age', 'gender'];
        const invalidFields = Object.keys(req.body).filter(
            field => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: 'Invalid fields',
                fields: invalidFields
            });
        }

        const patient = await patientModel.findPatientById(id);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        const updatedPatient = await patientModel.updatePatient(
            id,
            req.body
        );

        return res.status(200).json({
            message: 'Patient updated successfully',
            patient: updatedPatient
        });

    } catch (err) {
        next(err);
    }
};

// Patient: Update their own personal information only.
const updateMyProfile = async (req, res, next) => {
    try {
        const patientId = req.user.profileId;

        if (!patientId) {
            return res.status(404).json({
                error: 'Patient profile not found'
            });
        }

        const allowedFields = ['username', 'phone', 'age', 'gender'];
        const invalidFields = Object.keys(req.body).filter(
            field => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: 'Invalid fields',
                fields: invalidFields
            });
        }

        const patient = await patientModel.findPatientById(patientId);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient profile not found'
            });
        }

        const updatedPatient = await patientModel.updatePatient(
            patientId,
            req.body
        );

        return res.status(200).json({
            message: 'Profile updated successfully',
            patient: updatedPatient
        });

    } catch (err) {
        next(err);
    }
};

// Admin: Deactivate a patient account without deleting patient data.
const deactivatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await patientModel.findPatientById(id);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        if (!patient.user.isActive) {
            return res.status(400).json({
                error: 'Patient account is already deactivated'
            });
        }

        const deactivatedUser = await patientModel.deactivatePatient(id);

        return res.status(200).json({
            message: 'Patient account deactivated successfully',
            user: deactivatedUser
        });

    } catch (err) {
        next(err);
    }
};

// Admin: Reactivate a patient account.
const activatePatient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const patient = await patientModel.findPatientById(id);

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        if (patient.user.isActive) {
            return res.status(400).json({
                error: 'Patient account is already active'
            });
        }

        const activatedUser = await patientModel.activatePatient(id);

        return res.status(200).json({
            message: 'Patient account reactivated successfully',
            user: activatedUser
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    getMyProfile,
    updatePatient,
    updateMyProfile,
    deactivatePatient,
    activatePatient
};