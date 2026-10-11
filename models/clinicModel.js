const prisma =require('../config/prisma');
async function getClinic(){
    return prisma.clinics.findFirst({
include:{
    doctors:{
        select:{
            id:true,
            name:true,
            specialty:true,
    },
    },
},
    });
}
module.exports={getClinic};