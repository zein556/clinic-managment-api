const prisma=require('../config/prisma');
const getDoctors=async(req,res)=>{
try{
const doctors=await prisma.doctors.findMany({
    orderBy:{id:'asc'},
    include:{
        user:{
            select:{email:true}
        }
    }
});     
return res.status(200).json({doctors});
}catch(err){
            console.error("Error fetching doctors",err);
            return res.status(500).json({error:"Database error while fetching doctors"});
        }
        
        }
    
const getDoctorById=async(req,res)=>{
    try{
const {id}=req.params;
const doctor=await prisma.doctors.findUnique({where:{id:parseInt(id)}});
if(!doctor){
    return res.status(404).json({error:"Doctor not found"});
}
return res.status(200).json({doctor});
    }catch(err){
        console.error("Error fetching doctor",err);
        return res.status(500).json({error:"Database error while fetching doctor"});
    } 
}
const getDoctorBySpecialty=async(req,res)=>{
    try{
        const{specialty}=req.params;
        const doctors=await prisma.doctors.findMany({where:{
            specialty:{
                contains:specialty,
                mode:'insensitive'
            }
        },
    orderBy:{id:'asc'}
    });
        if(doctors.length===0){
            return res.status(404).json({error:"No doctors found for this specialty"});
        }
        return res.status(200).json({doctors});
    }catch(err){
        console.error("ERROR fetching doctors by specialty:",err);
        return res.status(500).json({error:"Database error while fetching doctors"});
    }
}
const createDoctor=async(req,res)=>{
try{
    const{name,specialty,phone,user_id}=req.body;
if(!name||!specialty||!user_id){
    return res.status(400).json({error:"Name,specialty and user_id are required"});
}
const newdoctor=await prisma.doctors.create({data:
    {name,
    specialty,
    phone,
user_id:parseInt(user_id)}
});
return res.status(201).json({message:"Doctor created successfully",doctor:newdoctor});

}catch(err){
    console.error("ERROR creating doctor",err);
    return res.status(500).json({error:"Database error while creating doctor"});
}
}
const updateDoctor=async(req,res)=>{
try{
    const{id}=req.params;
    const{name,specialty,phone}=req.body;
    const doctor_id=parseInt(id,10);
    if(isNaN(doctor_id)){
        return res.status(400).json({error:"Invalid doctor Id"});
    }
    const existingDoctor=await prisma.doctors.findUnique({
        where:{id:doctor_id}
    });
    if(!existingDoctor){
        return res.status(404).json({error:"Doctor not found"});
    }
    const updatedDoctor=await prisma.doctors.update({where:{id:doctor_id},data:{ ...(name&&{name}),...(specialty&&{specialty}),...(phone && {phone})}});
res.status(200).json({message:"Doctor updated successfully",doctor:updatedDoctor});
}catch(err){
    console.error("ERROR updating doctor",err);
    return res.status(500).json({error:"Database error while updating doctor"});
}
}
const deleteDoctor=async(req,res)=>{
    try{
        const{id}=req.params;
        const doctor_id=parseInt(id,10);
        if(isNaN(doctor_id)){
            return res.status(400).json({error:"Invalid doctor ID"});
        }
        const existingDoctor=await prisma.doctors.findUnique({where:{id:doctor_id}});
        if(!existingDoctor){
            return res.status(404).json({error:"Doctor not found"});
        }
        await prisma.doctors.delete({where:{id:doctor_id}});
       return res.status(200).json({message:"Doctor deleted successfully",doctor:existingDoctor});
    }catch(err){
        console.error("ERROR deleting doctor",err);
        return res.status(500).json({error:"Database error while deleting doctor"});
    }
}
module.exports={getDoctors,getDoctorById,getDoctorBySpecialty,createDoctor,updateDoctor,deleteDoctor};
