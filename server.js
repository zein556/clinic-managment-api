require('dotenv').config();
const express =require("express");
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const app=express();
const errorMiddleware=require('./middlewares/errorMiddleware');
const doctorsRoutes=require('./routes/doctorsRoutes');
const appointmentsRoutes=require('./routes/appointmentsRoutes');
const authRoutes=require('./routes/authRoutes');
const patientsRoutes=require('./routes/patientsRoutes');
const PORT=process.env.PORT||4000;
const limiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:{
        status:'fail',
        message:'Too many requests from this IP, please try again after 15 minutes !'
    }
});
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/doctors',doctorsRoutes);
app.use('/appointments',appointmentsRoutes);
app.use('/auth',authRoutes);
app.use('/patients',patientsRoutes);
app.use((req,res,next)=>{
    res.status(404).json({
        status:'fail',
        message:`cannot find ${req.originalUrl} on this server!`
    });
})
app.use(errorMiddleware);

app.listen(PORT,()=>{
    console.log(`server is running perfectly on port ${PORT}`);
});

