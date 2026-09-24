const doctorModel=require('../models/doctorModel');
const userModel=require('../models/userModel');
const bcrypt=require('bcrypt');
const getDoctors=async(req,res,next)=>{
try{
const doctors=await doctorModel.findAllDoctors();
return res.status(200).json({doctors});
}catch(err){
next(err);
        }
}
const getDoctorById=async(req,res,next)=>{
    try{
const {id}=req.params;
const doctor=await doctorModel.findDoctorById(parseInt(id));
if(!doctor){
    return res.status(404).json({error:"Doctor not found"});
}
return res.status(200).json({doctor});
    }catch(err){
      next(err);
}
}        
const createDoctor=async(req,res,next)=>{
try{
    const{username,specialty,phone,email,password}=req.body;
    const existingUser=await userModel.findUserByEmail(email);
    if(existingUser){
        return res.status(400).json({error:"Email already exists"});
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const newUser=await userModel.createUser({
        email,
        password:hashedPassword,
        role:'doctor'
    });
    const newDoctor=await doctorModel.createDoctor({
        name:username ,
        specialty,
        phone,
        user_id:newUser.id
    });
        return res.status(201).json({message:"Doctor created successfully",doctor:newDoctor});

}catch(err){
  next(err);
}
}
const updateDoctor=async(req,res,next)=>{
try{
    const{id}=req.params;
   const updatedDoctor=await doctorModel.updateDoctor(id,req.body);
   return res.status(200).json({message:"Doctor profile updated",doctor:updatedDoctor}); 
}catch(err){
    next(err);
}
}
const deleteDoctor=async(req,res,next)=>{
    try{
        const{id}=req.params;
        const doctor=await doctorModel.findDoctorById(id);
        if(!doctor){
            return res.status(404).json({error:"Doctor not found"});
        }
        await doctorModel.deleteDoctor(id);
        return res.status(200).json({message:"Doctor deleted successfully",doctor});
    }catch(err){
        next(err);
    }
}
module.exports={getDoctors,getDoctorById,createDoctor,updateDoctor,deleteDoctor};
