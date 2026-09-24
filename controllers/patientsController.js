    const patientModel=require('../models/patientModel');
    const userModel=require('../models/userModel');
    const bcrypt=require('bcrypt');
    const createPatient=async(req,res,next)=>{
        try{
            const{username,phone,email,password,medical_history,age,gender}=req.body;
            const existingUser=await userModel.findUserByEmail(email);
            if(existingUser){
                return res.status(400).json({error:"Email already exists"});
            }
            const hashedPassword=await bcrypt.hash(password,10);
            const newUser=await userModel.createUser({
                email,
                password:hashedPassword,
                role:'patient'
            });
            const newPatient=await patientModel.createPatient({
                name,
                phone,
                age,
                gender,
                medical_history,
                user_id:newUser.id
            });
            return res.status(201).json({message:"Patient created successfully",patient:newPatient});
        }catch(err){
            next(err);
        }
    };
const getPatients =async(req,res,next)=>{
try{
const patients=await patientModel.findAllPatients();
return res.status(200).json({patients});
}catch(err){
next(err);
};
}
const getPatientById=async (req,res,next)=>{
try{
    const {id}=req.params;
const patient=await patientModel.findPatientById(id);
if(!patient){
    return res.status(404).json({error:"Patient Not Found"});
}
return res.status(200).json({patient});
}catch(err){
next(err);
}
}
const updatePatient=async(req,res,next)=>{
    try{
const{id}=req.params;
const updatedPatient=await patientModel.updatePatient(id,req.body);
return res.status(200).json({message:"Patient updated successfully",patient:updatedPatient});
}catch(err){
    next(err);
}
}
const deletePatient=async(req,res,next)=>{
    try{
const{id}=req.params;
const patient =await patientModel.findPatientById(id);
if(!patient){
    return res.status(404).json({error:"Patient not found"});
}
await patientModel.deletePatient(id);
return res.status(200).json({message:"Patient deleted successfully"});
}catch(err){
    next(err);
}
}
module.exports={
createPatient,
getPatients,
getPatientById,
updatePatient,
deletePatient
};