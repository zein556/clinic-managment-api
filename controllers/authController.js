const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const userModel=require('../models/userModel');
const doctorModel=require('../models/doctorModel');
const patientModel=require('../models/patientModel');
const register = async (req,res,next)=>{
    try{
        const {email,password,role='patient',username,phone=null,specialty='General',medical_history=null,
            age=null,gender=null}=req.body;
            const existingUser=await userModel.findUserByEmail(email);
            if(existingUser){
return res.status(400).json({error:"Email already exists"});
                            }
const hashedPassword=await bcrypt.hash(password,10);
 const normalizedRole=role?role.toLowerCase():'patient';
const newUser=await userModel.createUser({email,password:hashedPassword,role: normalizedRole});
if(normalizedRole==='doctor'){
    await doctorModel.createDoctor({username,phone,specialty,user_id:newUser.id});}
    else{
        await patientModel.createPatient({username,phone,medical_history,age,gender,user_id:newUser.id});
    }   
return res.status(201).json({message:"User registered successfully",user:{id:newUser.id,email:newUser.email,role:newUser.role}});

}catch(err){
       next(err);
    }
}
const login=async(req,res,next)=>{
    try{
        const{email,password}=req.body;
        const user=await userModel.findUserByEmail(email);
       if(!user||!(await bcrypt.compare(password,user.password))){
            return res.status(400).json({error:"Invalid email or password"});
        }
let profileId=null;
if(user.role==='doctor'){
const doctorObj=user.doctors || user.doctor;        
profileId=Array.isArray(doctorObj)?doctorObj[0]?.id:doctorObj?.id;
}else if(user.role==='patient'){
const patientObj=user.patients || user.patient;
profileId=Array.isArray(patientObj)?patientObj[0]?.id:patientObj?.id;
}
const token=jwt.sign(
            {id:user.id,email:user.email,role:user.role,profileId:profileId},
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );
        return res.status(200).json({
            message:"Login successful!",
            token,
            user:{
                id:user.id,
                email:user.email,
                role:user.role,
                profileId:profileId
            }
        });
    }catch(err){
        next(err);
    }
}
const logout=async(req,res,next)=>{
    try{
return res.status(200).json({message:"logout successful!"});
}catch(err){
    next(err);
}
}
module.exports={register,login,logout};