const prisma=require('../config/prisma');
const createPatient=async(patientData)=>{
    return await prisma.patients.create({
        data:{
            name:patientData.username,
            phone:patientData.phone,
            user_id:patientData.user_id,
            medical_history:patientData.medical_history,
            age:patientData.age,
            gender:patientData.gender   
        }
    });
}
const findAllPatients=async()=>{
    return await prisma.patients.findMany({
        include:{
            user:{select:{id:true,name:true,email:true}}
        }
    });
}
const findPatientById=async(id)=>{
    return await prisma.patients.findUnique({
        where:{id:parseInt(id,10)},
        include:{
            user:{select:{id:true,name:true,email:true}}
        }
    });
}
const updatePatient=async(id,updateData)=>{
    return await prisma.patients.update({
        where:{id:parseInt(id,10)},
        data:updateData
    });
}
const deletePatient=async(id)=>{
    return await prisma.patients.delete({
        where:{id:parseInt(id,10)}
    });
}
module.exports={
    createPatient,
    findAllPatients,
    findPatientById,
    updatePatient,
    deletePatient
};