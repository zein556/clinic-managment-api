const prisma = require('../config/prisma');

async function getClinic() {
    return prisma.clinics.findFirst({
        include: {
            doctors: {
                select: {
                    id: true,
                    name: true,
                    specialty: true
                }
            }
        }
    });
}

async function updateClinic(id, clinicData) {
    return prisma.clinics.update({
        where: { id },
        data: {
            name: clinicData.name,
            address: clinicData.address,
            latitude: clinicData.latitude,
            longitude: clinicData.longitude
        },
        include: {
            doctors: {
                select: {
                    id: true,
                    name: true,
                    specialty: true
                }
            }
        }
    });
}

module.exports = {
    getClinic,
    updateClinic
};