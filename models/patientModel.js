
const prisma = require('../config/prisma');

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

const findPatientById = async (id) => {
    return await prisma.patients.findUnique({
        where: { id: parseInt(id, 10) },
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

const updatePatient = async (id, updateData) => {
    return await prisma.patients.update({
        where: { id: parseInt(id, 10) },
        data: updateData
    });
};

// Deactivate patient account without deleting patient data
const deactivatePatient = async (id) => {
    const patient = await prisma.patients.findUnique({
        where: { id: parseInt(id, 10) },
        select: { user_id: true }
    });

    if (!patient) {
        return null;
    }

    return await prisma.users.update({
        where: { id: patient.user_id },
        data: { isActive: false },
        select: {
            id: true,
            email: true,
            isActive: true
        }
    });
};
// Reactivate patient account without changing patient data
const activatePatient = async (id) => {
  const patient = await prisma.patients.findUnique({
    where: { id: parseInt(id, 10) },
    select: { user_id: true }
  });

  if (!patient) return null;

  return await prisma.users.update({
    where: { id: patient.user_id },
    data: { isActive: true },
    select: {
      id: true,
      email: true,
      isActive: true
    }
  });
};
module.exports = {
    createPatient,
    findAllPatients,
    findPatientById,
    updatePatient,
    deactivatePatient,
    activatePatient
};
