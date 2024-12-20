# Hospital Management System (HMS)

## Overview
The **Hospital Management System (HMS)** is a comprehensive web-based platform designed to handle hospital operations. It provides an easy-to-use interface for **Root**, **Admin**, **Doctors**, and **Patients** to manage various tasks like user authentication, appointments, medical reports, and patient details.

---

## Features

### 1. Root Features
The **Root** user has full control over the system. The root user can manage both admin and doctor accounts and modify core settings for the hospital system.

#### Key Root Functions:
- **Root Authentication**: Login and manage root account.
- **Admin Management**: Create, update, and delete admin profiles.
- **Doctor Management**: Add, update, and delete doctor profiles.
- **Password Management**: Reset root password.

#### Root Routes:
- `POST /login-root`: Root login.
- `POST /create-admin`: Create a new admin.
- `PATCH /update-admin-root/:id`: Update admin profile by root.
- `DELETE /delete-admin/:id`: Delete an admin by ID.

---

### 2. Admin Features
Admins have control over the hospital system to manage doctor and patient profiles, appointments, and more.

#### Key Admin Functions:
- **Admin Authentication**: Login.
- **Doctor Management**: Add, update, and delete doctor profiles.
- **Patient Management**: View, update, and delete patient records.
- **Password Management**: Admins can reset their password and change login credentials.

#### Admin Routes:
- `POST /login-admin`: Admin login.
- `GET /get-admin`: View admin profile.
- `POST /create-admin`: Create a new admin.
- `PATCH /update-admin`: Update admin profile.
- `GET /get-doctorByID`: Get a doctor by ID, phone, or name.
- `POST /create-doctor`: Add a new doctor.
- `PATCH /update-doctor/:id`: Update doctor information.
- `DELETE /delete-doctor/:id`: Delete a doctor by ID.
- `PATCH /forget-password`: Request password reset.
- `PATCH /reset-password/:code`: Reset password using a reset code.

---

### 3. Doctor Features
Doctors can log in, manage patient appointments, and update medical reports. They also have access to their own profile and can update their information.

#### Key Doctor Functions:
- **Doctor Authentication**: Login and manage doctor accounts.
- **Appointment Management**: View, approve, or reject patient appointments.
- **Medical Reports**: Create, update, and view patient medical reports.
- **Profile Management**: Update doctor details ie(Only password).

#### Doctor Routes:
- `POST /login-doctor`: Doctor login.
- `PATCH /update-doctor`: Update doctor profile.
- `POST /create-report`: Create a medical report for a patient.
- `PATCH /update-report`: Update an existing medical report.
- `GET /view-report`: View a specific medical report.
- `GET /get-doctors`: Get a list of doctors.
- `GET /view-appointment`: View patient appointments for a doctor.
- `PATCH /approve-appointment`: Approve a patient appointment.
- `PATCH /reject-appointment`: Reject a patient appointment.
- `PATCH /forget-password`: Request password reset.
- `PATCH /reset-password/:code`: Reset password using a reset code.

---

### 4. Patient Features
Patients can register, log in, manage their appointments, and view their medical reports.

#### Key Patient Functions:
- **Patient Authentication**: Login, update profile, and manage password.
- **Appointment Management**: Create and view patient appointments.
- **Medical Reports**: View medical reports generated by doctors.
- **Profile Management**: Update patient details and photo.

#### Patient Routes:
- `POST /login-patient`: Patient login.
- `PATCH /update-patient`: Update patient profile.
- `POST /create-appointment`: Book a new appointment with a doctor.
- `GET /view-appointment`: View patient appointments.
- `DELETE /delete-patient/:id`: Delete a patient by ID.
- `GET /view-report`: View specific medical report for a patient.
- `GET /search`: Search for a patient by name.
- `PATCH /forget-password`: Request password reset.
- `PATCH /reset-password/:code`: Reset password using a reset code.

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer (for file uploads, e.g., doctor photos)
- **Password Security:** bcrypt

---
