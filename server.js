require('dotenv').config();
const express =require("express");
const app=express();
const errorMiddleware=require('./middlewares/errorMiddleware');
const doctorsRoutes=require('./routes/doctorsRoutes');
const appointmentsRoutes=require('./routes/appointmentsRoutes');
const authRoutes=require('./routes/authRoutes');
const patientsRoutes=require('./routes/patientsRoutes');
const PORT=process.env.PORT||4000;


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/doctors',doctorsRoutes);
app.use('/appointments',appointmentsRoutes);
app.use('/auth',authRoutes);
app.use('/patients',patientsRoutes);
app.use((req,res,next)=>{
    const error=new Error(`Cannot find ${req.originalUrl} on this server!`);
    error.statusCode=404;
    next(error);
});
app.use(errorMiddleware);

app.listen(PORT,()=>{
    console.log(`server is running perfectly on port ${PORT}`);
});

