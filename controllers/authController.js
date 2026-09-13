const prisma=require('../config/prisma');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const register = async (req,res)=>{
    try{
        const {email,password,role,name,phone,specialty,medical_history}=req.body;
        const existingUser=await prisma.users.findUnique({where:{email}});
            if(existingUser){
return res.status(400).json({error:"Email already exists"});
                            }
const hashedpassword=await bcrypt.hash(password,10);
const result=await prisma.$transaction(async(tx)=>{
const newUser=await tx.users.create({data:{email,password:hashedpassword,role:role||'patient'}});    
   if(newUser.role==='doctor'){
        await tx.doctors.create({data:{name:name||'Dr.Anonymous',specialty:specialty||'General',phone:phone||null,user_id:newUser.id}});
    }else if(newUser.role==='patient'){
        await tx.patients.create({data:{name:name||'patient name',phone:phone||null,medical_history:medical_history||null,user_id:newUser.id}});
    }    
    return newUser; });
    return res.status(201).json({message:"User registered successfully",user:{id:result.id,email:result.email,role:result.role}});
    }catch(err){
        console.error("Error registering user",err);
        res.status(500).json({error:"Database error while registering user"});
    }
}
const login=async(req,res)=>{
    try{
        const{email,password}=req.body;
        const user=await prisma.users.findFirst({where:{email},include:{doctor:true,patient:true}});
        if(!user){
            return res.status(400).json({error:"Invalid email or password"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({error:"Invalid email or password"});
        }
const profileId=user.doctor?.id||user.patient?.id||null;

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
        console.error("Error logging in user",err);
        res.status(500).json({error:"Database error occurred"});
    }
}
const logout=async(req,res)=>{
    try{
return res.status(200).json({message:"logout successful!"});
}catch(err){
    console.error("Error logging out:",err);
}
}
module.exports={register,login,logout};