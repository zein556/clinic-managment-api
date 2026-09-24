const AppointmentModel=require('../models/appointmentsModel');
const  createAppointment=async(req,res,next)=>{
    try{
        const {doctor_id,appointment_date,appointment_time}=req.body;
        const patient_id=req.user.profileId;
        if(!patient_id){
            return res.status(400).json({error:"Only patients can book appointments"});
        }
        const existingAppointment =await AppointmentModel.findConflict(doctor_id,appointment_date,appointment_time);
        if(existingAppointment){
            return res.status(400).json({error:"Doctor is already booked at this time!"});
        }
       const appointmentData={
doctor_id:parseInt(doctor_id,10),
patient_id:parseInt(patient_id,10),
appointment_date:new Date(appointment_date),
appointment_time:appointment_time,
status:'pending'
       }
        const newAppointment=await AppointmentModel.createAppointment(appointmentData);
        return res.status(201).json({
            message:"Appointment booked successfully",
            appointment:newAppointment
                })
            }catch(err){
               next(err);
            }
        }
const getAppointments=async(req,res,next)=>{
    try{ 
const {role,profileId}=req.user;
console.log("logged in role",role);

let whereClause={};
if(role==='doctor'){
  whereClause={doctor_id:parseInt(profileId,10)};
}else if (role==='patient'){
    whereClause={patient_id:parseInt(profileId,10)};
}

const appointments=await AppointmentModel.findAllAppointments(whereClause);
if(appointments.length===0){
    return res.status(404).json({error:"No appointments found"});
}
return res.status(200).json(appointments);
}catch(err){
next(err);
}
}

const getAppointmentById=async(req,res,next)=>{
    try{
const {id}=req.params;
const {role,profileId}=req.user;
const appointment=await AppointmentModel.findAppointmentById(id);
if(!appointment){
    return res.status(404).json({error:"Appointment not found"});   
}
const isAuthorized=
role==='admin'||(role==='doctor'&&appointment.doctor_id===profileId)||(role==='patient'&&appointment.patient_id===profileId);
if(!isAuthorized){
    return res.status(403).json({error:"Access denied.You cannot view this appointment"});
}
res.status(200).json({appointment});
}catch(err){
        next(err);
    }
}
const updateAppointment=async(req,res,next)=>{
    try{
        const{id}=req.params ;
        const{appointment_date,appointment_time,status,doctor_id}=req.body;
        const {role,profileId}=req.user;
        const appointment=await AppointmentModel.findAppointmentById(id);
        if(!appointment){
            return res.status(404).json({error:"Appointment not found"});
        }
        let updatedData={};
if(role==='patient'){
    if(appointment.patient_id !==profileId){
        return res.status(403).json({message:'Unauthorized to update this appointment'});
    }
    if(appointment_date)updatedData.appointment_date=new Date(appointment_date);
    if(appointment_time)updatedData.appointment_time=appointment_time;
} else if(role === 'doctor') {
    if(appointment.doctor_id!==profileId){
        return res.status(403).json({message:'Unauthorized to update this appointment'});
    }
if(status) updatedData.status=status;
} else if (role==='admin'){
    if(doctor_id) updatedData.doctor_id=parseInt(doctor_id,10);
    if(appointment_date)updatedData.appointment_date=new Date(appointment_date);
    if(appointment_time)updatedData.appointment_time=appointment_time;
    if(status) updatedData.status =status;
}
      const targetDoctorId=updatedData.doctor_id||appointment.doctor_id;
        const parsedDate=appointment_date?new Date(appointment_date):appointment.appointment_date;
        const newTime=appointment_time||appointment.appointment_time;
        if(appointment_date|| appointment_time || doctor_id){
        const conflict=await AppointmentModel.findConflictForUpdate(targetDoctorId, parsedDate, newTime, id);
if(conflict){
        return res.status(400).json({error:"Doctor is already booked at this new time!"});
}  
        }
const updatedAppointment=await AppointmentModel.updateAppointment(id, updatedData);
return res.status(200).json({message:"Appointment updated successfully",appointment:updatedAppointment});
    }catch(err){
        next(err);
    }
}
const deleteAppointment =async(req,res,next)=>{
    try{    
    const{id}=req.params;
    const{role,profileId}=req.user;
    const appointment=await AppointmentModel.findAppointmentById(id);
    if(!appointment){
        return res.status(404).json({error:"Appointment not found"});
    }
   const isAuthorized=role==='admin'||(role==='doctor'&&appointment.doctor_id===profileId)||(role==='patient'&&appointment.patient_id===profileId);
    if(!isAuthorized){
        return res.status(403).json({error:"Access denied.You cannot delete this appointment"});
    }
    await AppointmentModel.deleteAppointment(id);
    return res.status(200).json({message:"Appointment deleted successfully"});  

    } catch(err){
        next(err);
    }       
}
module.exports={createAppointment,getAppointments,getAppointmentById,updateAppointment,deleteAppointment};