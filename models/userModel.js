const prisma=require('../config/prisma');
const findUserByEmail=async(email)=>{
    return await prisma.users.findUnique({
        where:{email},
        include:{doctor:true,patient:true}
    });
}
const findUserById=async(id)=>{
    return await prisma.users.findUnique({
        where:{id:parseInt(id,10)},
        include:{doctor:true,patient:true}
    });
}   
const createUser=async(userData)=>{
    return await prisma.users.create({
        data:userData
    });
}
module.exports={
    findUserByEmail,
    findUserById,
    createUser
};