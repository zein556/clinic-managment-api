const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const doctorModel = require('../models/doctorModel');
const patientModel = require('../models/patientModel');

const register = async (req, res, next) => {
    try {
        const {
            email,
            password,
            username,
            phone = null,
            specialty = 'General',
            age = null,
            gender = null
        } = req.body;

        // Convert empty medical history to null.
        const medical_history =
            typeof req.body.medical_history === 'string' &&
            req.body.medical_history.trim() !== ''
                ? req.body.medical_history.trim()
                : null;

        const existingUser = await userModel.findUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const normalizedRole = 'patient';

        let newUser;

        if (normalizedRole === 'doctor') {
            newUser = await userModel.createUser({
                email,
                password: hashedPassword,
                role: normalizedRole
            });

            await doctorModel.createDoctor({
                username,
                phone,
                specialty,
                user_id: newUser.id
            });
        } else {
            const newPatient = await patientModel.createPatientWithUser(
                {
                    email,
                    password: hashedPassword,
                    role: normalizedRole
                },
                {
                    username,
                    phone,
                    medical_history,
                    age,
                    gender
                }
            );

            newUser = {
                id: newPatient.user_id,
                email,
                role: normalizedRole
            };
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findUserByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({
                error: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                error: 'Your account has been deactivated. Please contact the administrator.'
            });
        }

        let profileId = null;
        let name = null;
        let specialty = null;

        if (user.role === 'doctor') {
            const doctor = user.doctor;

            if (doctor) {
                profileId = doctor.id;
                name = doctor.name;
                specialty = doctor.specialty;
            }
        } else if (user.role === 'patient') {
            const patient = user.patient;

            if (patient) {
                profileId = patient.id;
                name = patient.name;
            }
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId,
                name,
                specialty
            }
        });

    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: 'logout successful!'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    logout
};
