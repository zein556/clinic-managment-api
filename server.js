const cors = require('cors');
const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/errorMiddleware');
const doctorsRoutes = require('./routes/doctorsRoutes');
const appointmentsRoutes = require('./routes/appointmentsRoutes');
const authRoutes = require('./routes/authRoutes');
const patientsRoutes = require('./routes/patientsRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const notificationRoutes = require('./routes/notificationRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const { generalLimiter } = require('./middlewares/ratelimitMiddleware');
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
];

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin));
  }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/doctors', doctorsRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/auth', authRoutes);
app.use('/patients', patientsRoutes);
app.use('/medicalRecords', medicalRecordRoutes);
app.use('/notifications', notificationRoutes);
app.use('/clinic', clinicRoutes);

app.use((req, res, next) => {
  const error = new Error('Cannot find this route on this server!');
  error.statusCode = 404;
  next(error);
});

app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running perfectly on port ${PORT}`);
  });
}

module.exports = app;
