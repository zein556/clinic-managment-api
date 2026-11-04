
const prisma = require('../config/prisma');

// Find a user by email, including doctor and patient profiles
const findUserByEmail = async (email) => {
    return await prisma.users.findUnique({
        where: { email },
        include: {
            doctor: true,
            patient: true
        }
    });
};

// Find a user by ID, including doctor and patient profiles
const findUserById = async (id) => {
    return await prisma.users.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
            doctor: true,
            patient: true
        }
    });
};

// Create a new user
const createUser = async (userData) => {
    return await prisma.users.create({
        data: userData
    });
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUser
};
