# 🏥 Clinic Management System API

A robust RESTful Backend API built with Node.js, Express, Prisma ORM, and PostgreSQL for managing medical clinics, doctors, patients, and appointment bookings with role-based access control (RBAC).

---

## 🛠️ Tech Stack

- Runtime Environment: Node.js
- Framework: Express.js
- Database ORM: Prisma ORM
- Database: PostgreSQL
- Authentication: JSON Web Tokens (JWT) & Bcrypt
- Validation: Express-Validator
- API Testing & Documentation: Postman

---

## ✨ Key Features

- Authentication & Authorization: Secure registration and login supporting multiple user roles (Admin, Doctor, Patient).
- Doctor & Patient Management: Automated user profile linkage and primary key mapping upon creation.
- Role-Based Appointments: Custom scoping for fetching appointments based on logged-in identity (Doctors see their schedule, Patients see their bookings, Admin gets full access).
- Data Validation & Error Handling: Comprehensive request sanitization and global error handling middlewares.
- API Testing: Verified and debugged CRUD operations and relation mappings using Postman.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Installation

   git clone [https://github.com/zein556/clinic-managment-api.git]
   cd clinic-managment-api
