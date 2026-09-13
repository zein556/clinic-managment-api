const prisma =require('../config/prisma');

const findConflict=async(doctor_id,appointment_date,appointment_time)=>{
    return await prisma.appointments.findFirst({
        where:{
            doctor_id:parseInt(doctor_id,10),
            appointment_date:new Date(appointment_date),
            appointment_time:appointment_time
        }
    });
}
const createAppointment=async(appointmentData
)=>{
    return await prisma.appointments.create({
        data:appointmentData
    });
}   
const findAllAppointments =async(whereClause)=>{
    return await prisma.appointments.findMany({
        where:whereClause,
        orderBy:{id:'asc'},
        include:{
            doctor:{select:{id:true,name:true,specialty:true}},
            patient:{select:{id:true,name:true,phone:true}} 
        }
    });
}
const findAppointmentById=async(id)=>{
    return await prisma.appointments.findUnique({
        where:{id:parseInt(id,10)},
        include:{
            doctor:{select:{id:true,name:true,specialty:true}},
            patient:{select:{id:true,name:true,phone:true}} 
        }
    });
}
const findConflictForUpdate=async(doctor_id,appointment_date,appointment_time,currentAppointmentId)=>{
    return await prisma.appointments.findFirst({
        where:{
            doctor_id:parseInt(doctor_id,10),   
            appointment_date:new Date(appointment_date),
            appointment_time:appointment_time,
            id:{not:parseInt(currentAppointmentId,10)}
        }
    });
}
const updateAppointment=async(id,updateData)=>{
    return await prisma.appointments.update({
        where:{id:parseInt(id,10)},
        data:updateData
    });
}
const deleteAppointment=async(id)=>{
    return await prisma.appointments.delete({
        where:{id:parseInt(id,10)}
    });
}
module.exports={
    findConflict,
    createAppointment,
    findAllAppointments,
    findAppointmentById,
    findConflictForUpdate,
    updateAppointment,
    deleteAppointment
}