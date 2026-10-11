const prisma =require('../config/prisma');

const createNotification=async(notificationData)=>{
    return await prisma.Notification.create({
        data: notificationData
    });
};
const findNotificationsByUserId=async(user_id)=>{
    return await prisma.Notification.findMany({
        where:{user_id:parseInt(user_id,10)},
        orderBy:{createdAt:'desc'}
    });
}
const findUnreadNotificationsByUserId=async(user_id)=>{
    return await prisma.Notification.findMany({
        where:{user_id:parseInt(user_id,10),is_read:false},
        orderBy:{createdAt:'desc'}
    });
}
const findNotificationById=async(id)=>{
    return await prisma.Notification.findUnique({
        where:{id:parseInt(id,10)}
    });
}
const markNotificationAsRead=async(id)=>{
    return await prisma.Notification.update({
        where:{id:parseInt(id,10)},
        data:{is_read:true}
    });
}
const markAllNotificationsAsRead=async(user_id)=>{
    return await prisma.Notification.updateMany({
        where:{user_id:parseInt(user_id,10),is_read:false},
        data:{is_read:true}
    });
}
const deleteNotification=async(id)=>{
    return await prisma.Notification.delete({
        where:{id:parseInt(id,10)}
    });
}
const createNotificationForDoctor=async(doctor_id,title,message,type)=>{
    const doctor=await prisma.doctors.findUnique({
        where:{id:parseInt(doctor_id,10)},
        select:{user_id:true}
    });
    if(!doctor){
        throw new Error('Doctor not found');
    }
    return await prisma.Notification.create({
        data: {
            user_id: parseInt(doctor.user_id),
            title,
            message,
            type
        }
    });
};
const createNotificationForPatient=async(patient_id,title,message,type)=>{
    const patient=await prisma.patients.findUnique({
        where:{id:parseInt(patient_id,10)},
        select:{user_id:true}
    });
    if(!patient){
        throw new Error('Patient not found');
    }
    return await prisma.Notification.create({
        data: {
            user_id: parseInt(patient.user_id),
            title,
            message,
            type
        }
    });
};
module.exports={
    createNotification,
    findNotificationsByUserId,
    findUnreadNotificationsByUserId,
    findNotificationById,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createNotificationForDoctor,
    createNotificationForPatient
};
