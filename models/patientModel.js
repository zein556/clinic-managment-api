
const prisma = require('../config/prisma');

// Create a patient profile.
const createPatient = async (patientData) => {
    return await prisma.patients.create({
        data: {
            name: patientData.username,
            phone: patientData.phone,
            user_id: patientData.user_id,
            medical_history: patientData.medical_history,
            age: patientData.age,
            gender: patientData.gender
        }
    });
};

// Create the user account and patient profile atomically.
const createPatientWithUser = async (userData, patientData) => {
    return await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
            data: userData
        });

        const newPatient = await tx.patients.create({
            data: {
                name: patientData.username,
                phone: patientData.phone,
                age: patientData.age,
                gender: patientData.gender,
                medical_history: patientData.medical_history,
                user_id: newUser.id
            }
        });

        return newPatient;
    });
};

// Retrieve all patients with their account information.
const findAllPatients = async () => {
    return await prisma.patients.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    isActive: true
                }
            }
        }
    });
};

// Retrieve one patient by patient ID.
const findPatientById = async (id) => {
    return await prisma.patients.findUnique({
        where: {
            id: parseInt(id, 10)
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    isActive: true
                }
            }
        }
    });
};

// Update patient information.
const updatePatient = async (id, updateData) => {
    const data = {};

    if (updateData.username !== undefined) {
        data.name = updateData.username;
    }

    if (updateData.phone !== undefined) {
        data.phone = updateData.phone;
    }

    if (updateData.age !== undefined) {
        data.age = Number(updateData.age);
    }

    if (updateData.gender !== undefined) {
        data.gender = updateData.gender;
    }

    if (updateData.medical_history !== undefined) {
        data.medical_history = updateData.medical_history;
    }

    return await prisma.patients.update({
        where: {
            id: parseInt(id, 10)
        },
        data
    });
};

// Deactivate a patient account without deleting patient data.
const deactivatePatient = async (id) => {
    const patient = await prisma.patients.findUnique({
        where: {
            id: parseInt(id, 10)
        },
        select: {
            user_id: true
        }
    });

    if (!patient) {
        return null;
    }

    return await prisma.users.update({
        where: {
            id: patient.user_id
        },
        data: {
            isActive: false
        },
        select: {
            id: true,
            email: true,
            isActive: true
        }
    });
};

// Reactivate a previously deactivated patient account.
const activatePatient = async (id) => {
    const patient = await prisma.patients.findUnique({
        where: {
            id: parseInt(id, 10)
        },
        select: {
            user_id: true
        }
    });

    if (!patient) {
        return null;
    }

    return await prisma.users.update({
        where: {
            id: patient.user_id
        },
        data: {
            isActive: true
        },
        select: {
            id: true,
            email: true,
            isActive: true
        }
    });
};

module.exports = {
    createPatient,
    createPatientWithUser,
    findAllPatients,
    findPatientById,
    updatePatient,
    deactivatePatient,
    activatePatient
};
