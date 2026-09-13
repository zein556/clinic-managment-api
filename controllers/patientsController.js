    const prisma = require("../config/prisma");
const getPatients =async(req,res)=>{
try{
const patients=await prisma.patients.findMany({
orderBy:{id:'asc'},
include:{
    user:{select:{email:true}}
}
})
return res.status(200).json({patients});
}catch(err){
console.error("Error fetching patients ",err);
return res.status(500).json({error:"Database error while fetching patients"});
};
}
const getPatientById=async (req,res)=>{
try{
    const {id}=req.params;
const patient_id=parseInt(id,10);
if(isNaN(patient_id)){
    return res.status(400).json({err:"Invalid patient ID"});
}
const patient=await prisma.patients.findUnique({
    where:{id:patient_id},
    include:{
        user:{select:{email:true}}
    }
});
if(!patient){
    return res.status(404).json({error:"Patient Not Found"});
}
return res.status(200).json({patient});
}catch(err){
    console.error("Error fetching patient ".err);
    return res.status(500).json({error:"Database error while fetching patient"});
}
}
const updatePatient=async(req,res)=>{
    try{
const{id}=req.params;
const{name,phone,age,gender,medical_history}=req.body;
const patient_id=parseInt(id,10);
if(isNaN(patient_id)){
    return res.status(400).json({error:"Invalid patient ID"});
}
const existingPatient=await prisma.patients.findUnique({
where:{id:patient_id}
});
if(!existingPatient){
    return res.status(404).json({error:"Patient Not Found"});
}
const updatedPatient=await prisma.patients.update({

where:{id:patient_id},
data:{
...(name && {name}),
...(phone && {phone}),
...(age &&{age}),
...(gender &&{gender}),
...(medical_history && {medical_history})
}
})
return res.status(200).json({message:"Patient updated successfully",patient:updatedPatient})
    }catch(err){
console.error("Error updating patient",err);
return res.status(500).json({error:"Database error while updating patient"});
    }
}
const deletePatient=async(req,res)=>{
    try{
const{id}=req.params;
const patient_id=parseInt(id,10);
if(isNaN(patient_id)){
    return res.status(400).json({error:"Invalid patient ID"});
}
const existingPatient=await prisma.patients.findUnique({
where:{id:patient_id}
});
if(!existingPatient){
    return res.status(404).json({error:"Patient Not Found"});
}
await prisma.patients.delete({where:{id:patient_id}}); 
return res.status(200).json({message:"Patient deletes successfully",patient:existingPatient});
}catch(err){
    console.error("Error deleting patient",err);
    return res.status(500).json({error:"Database error while deleting patient"});
}
}
module.exports={
getPatients,
getPatientById,
updatePatient,
deletePatient
};