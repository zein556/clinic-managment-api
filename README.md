🏥 Clinic Management System API

A RESTful API for managing clinic operations, including authentication, doctors, patients, appointments, medical records, prescriptions, clinics, and notifications.

Built with Node.js, Express.js, PostgreSQL, and Prisma ORM 6, the API includes JWT authentication, role-based authorization, request validation, rate limiting, automated tests, and interactive Swagger documentation.

🚀 Features

🔐 Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Supported roles: "admin", "doctor", and "patient"
- Rate limiting for general API requests and authentication attempts

👨‍⚕️ Doctors

- Create, retrieve, update, and delete doctors
- Link doctors to system users
- Associate doctors with clinics
- Store clinic-related location information

🧑‍🤝‍🧑 Patients

- Create, retrieve, update, and delete patients
- Link patients to system users
- Access patient resources according to authorization rules

📅 Appointments

- Create, retrieve, update, and delete appointments
- Associate appointments with doctors and patients
- Manage appointment statuses
- Check for conflicting doctor appointments
- Generate notifications when appointments are booked or their status changes

Supported appointment statuses:

- "pending"
- "confirmed"
- "cancelled"
- "completed"

🩺 Medical Records

- Create medical records associated with appointments
- Retrieve patient medical history
- Retrieve records by appointment
- Associate records with doctors and patients
- Include prescriptions when creating a medical record

Each appointment can have one medical record.

💊 Prescriptions

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

🏥 Clinics

- Retrieve clinic information
- Associate doctors with a clinic
- Store clinic name, address, latitude, and longitude
- Provide a Google Maps search URL based on clinic coordinates

🔔 Notifications

- Create notifications for relevant appointment events
- Notify doctors about new appointments
- Notify patients when appointments are booked or their status changes

🛡️ API Protection

- JWT authentication
- Role-based authorization
- Request validation
- Rate limiting using "express-rate-limit"
- Environment variables for sensitive configuration

📚 API Documentation

The API is documented using Swagger / OpenAPI.

Local documentation:

http://localhost:4000/api-docs

Deployed documentation:

https://clinic-managment-api-l511.onrender.com/api-docs

🛠️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM 6
- JSON Web Tokens (JWT)
- bcrypt
- Swagger / OpenAPI
- express-validator
- express-rate-limit
- Jest
- Supertest
- dotenv

📁 Project Structure

clinic-managment-api/
├── config/
│   ├── prisma.js
│   └── swagger.js
├── controllers/
│   ├── clinicController.js
│   ├── notificationController.js
│   ├── appointmentsController.js
│   └── medicalRecordController.js
├── middlewares/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   ├── validationMiddleware.js
│   └── ratelimitMiddleware.js
├── models/
│   ├── clinicModel.js
│   ├── NotificationModel.js
│   ├── doctorModel.js
│   └── medicalRecordModel.js
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── routes/
│   ├── clinicRoutes.js
│   ├── notificationRoutes.js
│   ├── appointmentsRoutes.js
│   ├── authRoutes.js
│   └── ...
├── tests/
│   ├── appointments.test.js
│   ├── auth.test.js
│   ├── doctors.test.js
│   ├── medicalRecords.test.js
│   ├── notifications.test.js
│   ├── patients.test.js
│   └── rateLimit.test.js
├── validators/
├── server.js
├── package.json
├── package-lock.json
└── README.md

🔑 Authentication

The API uses JWT Bearer Authentication.

After logging in, include the returned token in protected requests:

Authorization: Bearer YOUR_JWT_TOKEN
Swagger also supports JWT authentication through the Authorize button.

👥 User Roles

Admin

Can access administrative operations and protected resources permitted by the role middleware.

Doctor

Can access doctor-specific operations and create medical records for their appointments, subject to authorization rules.

Patient

Can access patient-specific resources and medical history according to the authorization rules.

📌 Main API Endpoints

The following endpoints summarize the main API routes. Check Swagger for the complete request schemas, response formats, and authorization requirements.

Authentication

Method| Endpoint
POST| "/auth/register"
POST| "/auth/login"

Patients

Method| Endpoint
POST| "/patients"
GET| "/patients"
GET| "/patients/:id"
PUT| "/patients/:id"
DELETE| "/patients/:id"

Doctors

Method| Endpoint
POST| "/doctors"
GET| "/doctors"
GET| "/doctors/:id"
PUT| "/doctors/:id"
DELETE| "/doctors/:id"

Appointments

Method| Endpoint
POST| "/appointments"
GET| "/appointments"
GET| "/appointments/:id"
PUT| "/appointments/:id"
DELETE| "/appointments/:id"

Medical Records

Method| Endpoint
POST| "/medicalRecords"
GET| "/medicalRecords/patient/:patient_id"
GET| "/medicalRecords/appointment/:appointment_id"

Clinics

Method| Endpoint
GET| "/clinic"

Notifications

Notifications are mounted under "/notifications". Consult Swagger for the exact available operations and their required permissions.

🩺 Medical Record Example

Example request body:

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

🗄️ Database

The project uses PostgreSQL with Prisma ORM 6.

Core entities include:

- Users
- Doctors
- Patients
- Clinics
- Appointments
- Medical records
- Prescriptions
- Notifications

Relationships

- Users can be associated with doctor or patient profiles.
- Clinics can be associated with multiple doctors.
- Doctors and patients are associated with appointments.
- An appointment can have one medical record.
- A medical record can include prescriptions.
- Notifications are associated with users.

⚙️ Installation

1. Clone the repository

git clone https://github.com/zein556/clinic-managment-api.git

2. Enter the project directory

cd clinic-managment-api

3. Install dependencies

npm install

🔐 Environment Variables

Create a ".env" file in the project root:

DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
PORT=4000

Use the actual PostgreSQL connection string and a strong, private JWT secret.

Never commit ".env" or other files containing credentials to GitHub.

🗃️ Prisma Setup

Generate the Prisma Client:

npx prisma generate

For a local development database, apply migrations with:

npx prisma migrate dev

For an existing production database, use the project's committed migrations and follow the production migration procedure. Do not use "migrate dev" against the production database.

▶️ Run the Project

Start the development server using the script configured in "package.json":

npm run dev

Alternatively, if the project does not define a development script:

node server.js

The local server runs on:

http://localhost:4000

📖 Swagger API Documentation

Once the server is running, open:

http://localhost:4000/api-docs

Swagger provides an interactive interface for exploring and testing documented API endpoints. It supports JWT authorization and includes documentation for the project's API routes.

🧪 Automated Tests

The project uses Jest and Supertest for automated API testing.

Run the test suite:

npm test -- --runInBand

Tests cover authentication, appointments, doctors, patients, medical records, notifications, and rate limiting.

🌐 Deployment

The API is deployed on Render.

Swagger documentation:https://clinic-managment-api-l511.onrender.com/api-docs

The React frontend can be deployed as a separate Render Static Site from this repository using the root `render.yaml` Blueprint. It builds from `frontend` and sets `VITE_API_URL` to the deployed API.

After the Static Site is created, copy its `https://...onrender.com` URL and set `FRONTEND_URL` on the API Web Service to that exact origin (without a trailing slash). The API allows that origin plus the local Vite development origins for CORS. Redeploy the API after changing the environment variable.

For a manual Static Site setup, use:

- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_URL=https://clinic-managment-api-l511.onrender.com`
- Rewrite Rule: `/*` to `/index.html`

Configure the required environment variables in the deployment environment:

- "DATABASE_URL"
- "JWT_SECRET"
- "PORT", if required by the hosting configuration

Ensure the production PostgreSQL database has all required Prisma migrations applied before relying on the updated API.

🔒 Security

Security measures include:

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Request validation
- Rate limiting
- Environment variables for secrets and database credentials

Never expose database credentials, JWT secrets, or other sensitive configuration in the repository.

🔮 Future Improvements

Potential future enhancements include:

- Pagination and filtering
- More advanced appointment scheduling
- Email or push notifications
- Docker support
- Expanded authorization and validation tests
- Additional clinic management features
- Improved production monitoring and deployment automation

👨‍💻 Author

Zein Dwai

GitHub: https://github.com/zein556

📄 License

This project is developed for educational and portfolio purposes. No specific open-source license has been declared.