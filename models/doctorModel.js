const prisma=require('../config/prisma');
const createDoctor=async(doctorData)=>{
    return await prisma.doctors.create({
        data:{
name:doctorData.name || doctorData.username,
specialty:doctorData.specialty,
phone:doctorData.phone,
user_id:doctorData.user_id

        }
    });
}
const findAllDoctors=async()=>{
    return await prisma.doctors.findMany({
        include:{
            user:{select:{id:true,email:true,role:true}}
        }
    });
}
const findDoctorById=async(id)=>{
    return await prisma.doctors.findUnique({
        where:{id:parseInt(id,10)},
        include:{
            user:{select:{id:true,email:true,role:true}}
        }
    });
}
const updateDoctor=async(id,updateData)=>{
    return await prisma.doctors.update({
        where:{id:parseInt(id,10)},
        data:{
            name:updateData.name || updateData.username,
            specialty:updateData.specialty,
            phone:updateData.phone
        }
    });
}
const deleteDoctor=async(id)=>{
    return await prisma.doctors.delete({
        where:{id:parseInt(id,10)}
    });
}
module.exports={
    createDoctor,
    findAllDoctors,
    findDoctorById,
    updateDoctor,
    deleteDoctor
};