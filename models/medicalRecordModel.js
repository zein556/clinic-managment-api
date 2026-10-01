const prisma =require('../config/prisma');

const createRecord =async(data,prescriptions=[]) => {
    return await prisma.medicalRecord.create({
        data:{
            appointment_id:data.appointment_id,
            patient_id:data.patient_id,
            doctor_id:data.doctor_id,
            diagnosis:data.diagnosis,
            notes:data.notes,
       prescriptions:{
        create:prescriptions
       }
        },
        include:{
            prescriptions:true,
            appointment:true
        }
    })
};
const getPatientHistory=async(patient_id)=>{
    return await prisma.medicalRecord.findMany({
        where:{patient_id:parseInt(patient_id,10)},
        include:{
            prescriptions:true,
            appointment:true
        },
        orderBy:{createdAt:'desc'}
    });
};
const findAppointmentWithDoctor =async(appointment_id)=>{
return await prisma.appointments.findUnique({
    where:{id:parseInt(appointment_id,10)}
});

};
const findDoctorByUserId =async(userId)=>{
    return await prisma.doctors.findUnique({
        where:{user_id:userId}
    });
};

const findPatientByUserId =async(userId)=>{
    return await prisma.patients.findUnique({
        where:{user_id:userId}
    });
}

const getRecordByAppointmentId=async(appointment_id)=>{
    return await prisma.medicalRecord.findUnique({
        where:{appointment_id:parseInt(appointment_id,10)},
        include:{
            prescriptions:true
        }
    });
};
module.exports={
    createRecord,
    getPatientHistory,
    getRecordByAppointmentId,
    findAppointmentWithDoctor,
    findDoctorByUserId,
    findPatientByUserId
}