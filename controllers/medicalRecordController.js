const medicalRecordModel =require('../models/medicalRecordModel');

const createRecord=async (req,res,next)=>{
try{
const {appointment_id,diagnosis,notes,prescriptions}=req.body;
const appointment=await medicalRecordModel.findAppointmentWithDoctor(appointment_id);
if(!appointment){
    return res.status(404).json({message:'Appointment not found'});
}
if(req.user.role === 'doctor'){
    const doctor =await medicalRecordModel.findDoctorByUserId(req.user.id);
    if(!doctor || doctor.id !== appointment.doctor_id){
        return res.status(403).json({message:'Unauthorized to add record for this appointment'});
    }
}
const newRecord= await medicalRecordModel.createRecord({
appointment_id :parseInt(appointment_id,10),
patient_id :appointment.patient_id,
doctor_id :appointment.doctor_id,
diagnosis,
notes},prescriptions ||[]);
res.status(201).json({
    message:'Medical record created successfully',
    data:newRecord
});
}catch(error){
    next(error);
}
}
const getPatientHistory =async (req,res,next)=>{
try{
    const {patient_id}=req.params;
if(req.user.role ==='patient'){
    const patient=await medicalRecordModel.findPatientByUserId(req.user.id);
if(!patient || patient.id !== parseInt(patient_id,10)){
    return res.status(403).json({message:'Access denied to this record history'});
}
}
const history =await medicalRecordModel.getPatientHistory(patient_id);
res.status(200).json({data:history});
}catch(error){
    next(error);
}
}
const getRecordByAppointment= async(req,res,next)=>{
try{
const{appointment_id}=req.params;
const record= await medicalRecordModel.getRecordByAppointmentId(appointment_id);
if(!record){
    return res.status(404).json({message:'Medical record not found for this appointment'});
}
res.status(200).json({data:record});
}catch(error){
    next(error);
}
}

module.exports={
    createRecord,
    getPatientHistory,
    getRecordByAppointment
};


