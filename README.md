# 🏥 Clinic Management System

A full-stack clinic management system designed to simplify and organize daily clinic operations.

The system provides tools for managing doctors, patients, appointments, medical records, prescriptions, clinics, and notifications through a RESTful API and a React-based user interface.

Built with **Node.js, Express.js, Prisma ORM 6, MySQL, and React**.

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login.
- JWT-based authentication.
- Password hashing using bcrypt.
- Role-based access control.
- Supported roles: `admin`, `doctor`, and `patient`.
- Rate limiting for API requests and authentication attempts.

### 👨‍⚕️ Doctors
- Create, retrieve, update, and delete doctors.
- Link doctors to system users.
- Associate doctors with clinics.
- Store clinic-related information.

### 🧑‍🤝‍🧑 Patients
- Create, retrieve, update, and delete patients.
- Link patients to system users.
- Manage patient information and access according to authorization rules.
- Support patient deactivation and reactivation, where implemented.

### 📅 Appointments
- Create, retrieve, update, and delete appointments.
- Associate appointments with doctors and patients.
- Manage appointment statuses.
- Check for conflicting doctor appointments.
- Generate notifications for appointment events.

Supported appointment statuses:

- `pending`
- `confirmed`
- `cancelled`
- `completed`

### 🩺 Medical Records
- Create medical records associated with appointments.
- Retrieve patient medical history.
- Retrieve records by appointment.
- Associate records with doctors and patients.
- Include prescriptions when creating a medical record.

Each appointment can have one medical record.

### 💊 Prescriptions

Prescriptions can be created together with a medical record.

Each prescription supports:

- Medication name
- Dosage
- Instructions

Example:

```json
{
  "medication_name": "Amoxicillin",
  "dosage": "500mg",
  "instructions": "3 times daily for 7 days"
}
```

### 🏥 Clinics
- Retrieve clinic information.
- Associate doctors with a clinic.
- Store clinic name, address, latitude, and longitude.
- Provide a Google Maps search URL based on clinic coordinates.

### 🔔 Notifications
- Create notifications for relevant appointment events.
- Notify doctors about new appointments.
- Notify patients when appointments are booked or their status changes.

### 🖥️ Frontend
The project includes a React-based frontend with dedicated dashboards for:

- Administrators
- Doctors
- Patients

The frontend communicates with the backend through API services and uses protected routes for access control.

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- Prisma ORM 6
- MySQL
- JSON Web Tokens (JWT)
- bcrypt
- Swagger / OpenAPI
- express-validator
- express-rate-limit
- dotenv

### Frontend
- React
- Vite
- CSS

### Testing
- Jest
- Supertest

## 📁 Project Structure

```text
clinic-managment-api/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── validators/
├── tests/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

## 🔑 Authentication

The API uses JWT Bearer Authentication.

After logging in, include the returned token in protected requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Swagger also supports JWT authentication through the **Authorize** button.

## 👥 User Roles

### Admin
Can access administrative operations and protected resources permitted by the role middleware.

### Doctor
Can access doctor-specific operations and create medical records for their appointments, subject to authorization rules.

### Patient
Can access patient-specific resources and medical history according to the authorization rules.

## 📌 Main API Endpoints

The following endpoints summarize the main API routes. Refer to Swagger for complete request schemas, response formats, and authorization requirements.

| Resource | Method | Endpoint |
|---|---|---|
| Authentication | POST | `/auth/register` |
| Authentication | POST | `/auth/login` |
| Patients | POST | `/patients` |
| Patients | GET | `/patients` |
| Patients | GET | `/patients/:id` |
| Patients | PUT | `/patients/:id` |
| Patients | DELETE | `/patients/:id` |
| Doctors | POST | `/doctors` |
| Doctors | GET | `/doctors` |
| Doctors | GET | `/doctors/:id` |
| Doctors | PUT | `/doctors/:id` |
| Doctors | DELETE | `/doctors/:id` |
| Appointments | POST | `/appointments` |
| Appointments | GET | `/appointments` |
| Appointments | GET | `/appointments/:id` |
| Appointments | PUT | `/appointments/:id` |
| Appointments | DELETE | `/appointments/:id` |
| Medical Records | POST | `/medicalRecords` |
| Medical Records | GET | `/medicalRecords/patient/:patient_id` |
| Medical Records | GET | `/medicalRecords/appointment/:appointment_id` |
| Clinics | GET | `/clinic` |

Notifications are mounted under `/notifications`. Consult Swagger for the exact available operations and their required permissions.

## 🩺 Medical Record Example

Example request body:

```json
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
```

A medical record is associated with one appointment.

## 🗄️ Database

The project uses **MySQL** with **Prisma ORM 6**.

Core entities include:

- Users
- Doctors
- Patients
- Clinics
- Appointments
- Medical records
- Prescriptions
- Notifications

### Relationships
- Users can be associated with doctor or patient profiles.
- Clinics can be associated with multiple doctors.
- Doctors and patients are associated with appointments.
- An appointment can have one medical record.
- A medical record can include prescriptions.
- Notifications are associated with users.

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/zein556/clinic-managment-api.git
```

### 2. Enter the project directory

```bash
cd clinic-managment-api
```

### 3. Install backend dependencies

```bash
npm install
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql_connection_string"
JWT_SECRET="your_strong_secret_key"
PORT=4000
```

Replace the example values with your actual MySQL connection string and a strong, private JWT secret.

For the frontend, create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:4000
```

Use the appropriate deployed API URL when running the frontend in production.

**Important:** Never commit `.env` files, database credentials, JWT secrets, or other sensitive configuration to GitHub.

## 🗃️ Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

For a local development database, apply migrations using:

```bash
npx prisma migrate dev
```

For production, use the committed migrations with:

```bash
npx prisma migrate deploy
```

Make sure the target database is MySQL and that its connection string is correctly configured before applying migrations.

## ▶️ Run the Project

### Start the Backend

From the project root:

```bash
npm run dev
```

If the project does not define a development script, use:

```bash
node server.js
```

The local backend runs at:

```text
http://localhost:4000
```

### Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Vite will display the local frontend URL in the terminal, usually:

```text
http://localhost:5173
```

## 📖 Swagger API Documentation

Once the backend is running, open:

```text
http://localhost:4000/api-docs
```

Deployed documentation:

https://clinic-managment-api-l511.onrender.com/api-docs

Swagger provides an interactive interface for exploring and testing documented API endpoints.

## 🧪 Automated Tests

The project uses Jest and Supertest for automated API testing.

Run the backend test suite from the project root:

```bash
npm test -- --runInBand
```

The tests cover authentication, appointments, doctors, patients, medical records, notifications, and other implemented API behavior.

## 🌐 Deployment

The backend API is deployed on Render.

Swagger documentation:

https://clinic-managment-api-l511.onrender.com/api-docs

The React frontend can be deployed separately as a Render Static Site.

For a manual Static Site setup:

- **Root Directory:** `frontend`
- **Build Command:** `npm ci && npm run build`
- **Publish Directory:** `dist`
- **Environment Variable:** `VITE_API_URL=https://clinic-managment-api-l511.onrender.com`
- **Rewrite Rule:** `/*` → `/index.html`

Configure the backend's CORS settings to allow the deployed frontend origin.

Configure the required environment variables in the backend deployment environment:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`, if required by the hosting configuration.

Ensure the production MySQL database has the required Prisma migrations applied before relying on the updated API.

## 🔒 Security

Security measures include:

- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Request validation
- Rate limiting
- Environment variables for secrets and database credentials

Never expose database credentials, JWT secrets, or other sensitive configuration in the repository.

## 🔮 Future Improvements

Potential future enhancements include:

- Pagination and filtering
- More advanced appointment scheduling
- Email or push notifications
- Docker support
- Expanded authorization and validation tests
- Additional clinic management features
- Improved production monitoring and deployment automation

## 👨‍💻 Author

**Zein Dwai**

GitHub: https://github.com/zein556

## 📄 License

This project is developed for educational and portfolio purposes. No specific open-source license has been declared.
