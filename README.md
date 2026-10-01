# 🏥 Clinic Management System API

A RESTful API for managing a clinic's core operations, including authentication, users, doctors, patients, appointments, medical records, and prescriptions.

The project is built with Node.js, Express.js, PostgreSQL, and Prisma ORM, with JWT-based authentication and Swagger API documentation.

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration
- User login
- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Supported roles: admin, doctor, patient

### 👨‍⚕️ Doctors
- Create doctors
- Get all doctors
- Get doctor by ID
- Update doctor
- Delete doctor
- Link doctors to system users

### 🧑‍🤝‍🧑 Patients
- Create patients
- Get patients
- Get patient by ID
- Update patient
- Delete patient
- Link patients to system users

### 📅 Appointments
- Create appointments
- Get appointments
- Get appointment by ID
- Update appointments
- Delete appointments
- Appointment status management
- Doctor and patient relationships

Supported appointment statuses:
- pending
- confirmed
- cancelled
- completed

### 🩺 Medical Records
- Create medical records
- Retrieve patient medical history
- Retrieve a medical record by appointment
- Connect medical records with appointments
- Associate records with doctors and patients

### 💊 Prescriptions
Prescriptions can be created together with a medical record.

Each prescription supports:
- Medication name
- Dosage
- Instructions

Example:
{
  "medication_name": "Amoxicillin",
  "dosage": "500mg",
  "instructions": "3 times daily for 7 days"
}

### 📚 API Documentation
The API is documented using Swagger / OpenAPI.

Local Swagger documentation:
http://localhost:4000/api-docs

## 🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Swagger / OpenAPI
- express-validator
- dotenv
- Nodemon

## 📁 Project Structure
```text
clinic-managment-api/
│
├── config/
│   ├── prisma.js
│   └── swagger.js
│
├── controllers/
│   ├── authController.js
│   ├── appointmentController.js
│   ├── doctorController.js
│   ├── patientController.js
│   └── medicalRecordController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── validationMiddleware.js
│
├── models/
│   ├── appointmentModel.js
│   ├── doctorModel.js
│   ├── patientModel.js
│   └── medicalRecordModel.js
│
├── prisma/
│   └── schema.prisma
│
├── routes/
│   ├── authRouter.js
│   ├── appointmentRouter.js
│   ├── doctorRouter.js
│   ├── patientRouter.js
│   └── medicalRecordRouter.js
│
├── validator/
│   ├── appointmentValidator.js
│   ├── medicalRecordValidator.js
│   └── ...
│
├── server.js
├── package.json
├── package-lock.json
└── README.md
```
## 🔑 Authentication

The API uses JWT Bearer Authentication.

After logging in, the API returns a JWT token.

Include the token in protected requests:

Authorization: Bearer YOUR_JWT_TOKEN

Swagger also supports JWT authentication through the Authorize button.

## 👥 User Roles

### Admin
Administrators have access to administrative operations and protected resources according to the API's role middleware.

### Doctor
Doctors can access doctor-specific operations and create medical records for their appointments.

### Patient
Patients can access patient-specific resources and their medical history according to the authorization rules.

## 📌 Main API Endpoints

### Authentication

POST /auth/register
POST /auth/login

### Patients

POST   /patients
GET    /patients
GET    /patients/:id
PUT    /patients/:id
DELETE /patients/:id

### Doctors

POST   /doctors
GET    /doctors
GET    /doctors/:id
PUT    /doctors/:id
DELETE /doctors/:id

### Appointments

POST   /appointments
GET    /appointments
GET    /appointments/:id
PUT    /appointments/:id
DELETE /appointments/:id

### Medical Records

POST /medicalRecords
GET /medicalRecords/patient/:patient_id
GET /medicalRecords/appointment/:appointment_id

## 🩺 Medical Record Example

A medical record can include prescriptions when it is created.

Example request:
{
  "appointment_id": 5,
  "diagnosis": "Acute Pharyngitis",
  "notes": "Patient should rest",
  "prescriptions": [
    {
      "medication_name": "Amoxicillin",
      "dosage": "500mg",
      "instructions": "3 times daily for 7 days"
    },
    {
      "medication_name": "Paracetamol",
      "dosage": "500mg",
      "instructions": "When needed"
    }
  ]
}

A medical record is associated with one appointment.

## 🗄️ Database

The project uses PostgreSQL with Prisma ORM.

The main database entities are:

- Users
- Doctors
- Patients
- Appointments
- MedicalRecords
- Prescriptions

### Relationships

User
├── Doctor
└── Patient

Doctor
└── Appointments

Patient
└── Appointments

Appointment
└── MedicalRecord
    └── Prescriptions

Each appointment can have one medical record.

## ⚙️ Installation

### 1. Clone the repository

git clone https://github.com/zein556/clinic-managment-api.git

### 2. Enter the project directory

cd clinic-managment-api

### 3. Install dependencies

npm install

## 🔐 Environment Variables

Create a .env file in the root directory:

DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
PORT=4000

Do not commit your .env file to GitHub.

Make sure .env is included in .gitignore.

## 🗃️ Prisma Setup

Generate the Prisma Client:

npx prisma generate

If you are using Prisma migrations:

npx prisma migrate dev

## ▶️ Run the Project

### Development

npm run dev

Or:

nodemon server.js

### Production

npm start

The server runs on:

http://localhost:4000

## 📖 Swagger API Documentation

Once the server is running, open:

http://localhost:4000/api-docs

Swagger provides an interactive interface for testing the API.

You can:
- Authenticate with JWT
- Register users
- Login
- Manage doctors
- Manage patients
- Manage appointments
- Create medical records
- Add prescriptions
- Retrieve patient history

## 🌐 Deployment

The API can be deployed to a cloud platform such as Render with a PostgreSQL database.

Before deployment, configure the required environment variables:

DATABASE_URL
JWT_SECRET
PORT

The production API URL can be added here after deployment.

## 🔒 Security

The project includes several security mechanisms:

- JWT authentication
- Password hashing using bcrypt
- Role-based authorization
- Protected routes
- Request validation
- Environment variables for sensitive configuration

Sensitive information such as database credentials and JWT secrets should never be committed to the repository.

## 🧪 API Testing

The API can be tested using:

- Swagger UI
- Postman
- Insomnia
- Any HTTP client

Swagger is available at:

http://localhost:4000/api-docs

## 🔮 Future Improvements

The project is still under development.

Possible future improvements include:

- More advanced appointment scheduling
- Improved authorization rules
- Pagination and filtering
- Better error handling
- Automated tests
- API rate limiting
- Email notifications
- Docker support
- Production deployment improvements
- Enhanced medical record management
- Prescription management improvements

## 👨‍💻 Author

Zein Dwai

GitHub:
https://github.com/zein556

## 📄 License

This project is currently developed for educational and portfolio purposes.
