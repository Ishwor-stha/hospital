# Patient Management System API

This is a backend API for managing patient data in a hospital management system. The API allows authorized users (admin, root, doctor) to perform CRUD operations on patient records, including creating new patients, updating their information, retrieving patient details, and deleting records. It also supports patient login, password reset functionality, and searching for patients by name or contact.

## Features

- **CRUD Operations for Patients**: Create, read, update, and delete patient records.
- **Patient Login**: Login functionality with JWT authentication.
- **Password Reset**: Allows patients to reset their passwords using a unique token.
- **Search Patients**: Search for patients by name or contact number.
- **Role-Based Access Control**: Access is restricted based on user roles (admin, root, doctor).

## Endpoints

### 1. **Get All Patients**
- **Endpoint**: `GET /api/patient/get-patients`
- **Description**: Retrieves all patient records.
- **Authorization**: Requires `root`, `admin`, or `doctor` role.

### 2. **Get Patient by ID**
- **Endpoint**: `GET /api/patient/get-patient/:id`
- **Description**: Retrieves a patient by their patient ID.
- **Authorization**: Requires `root`, `admin`, or `doctor` role.

### 3. **Create Patient**
- **Endpoint**: `POST /api/patient/create-patients`
- **Description**: Creates a new patient record.
- **Authorization**: Requires `root` or `admin` role.

### 4. **Login Patient**
- **Endpoint**: `POST /api/patient/login-patient`
- **Description**: Patient login with email and password.
- **Authorization**: None (for patient only).

### 5. **Update Patient**
- **Endpoint**: `PATCH /api/patient/update-patient/:id`
- **Description**: Updates a patient's details.
- **Authorization**: Requires `root` or `admin` role.

### 6. **Delete Patient**
- **Endpoint**: `DELETE /api/patient/delete-patient/:id`
- **Description**: Deletes a patient record.
- **Authorization**: Requires `root` or `admin` role.

### 7. **Search Patients**
- **Endpoint**: `GET /api/patient/search`
- **Description**: Searches for patients by name or contact number.
- **Authorization**: Requires `root`, `admin`, or `doctor` role.

### 8. **Forgot Password**
- **Endpoint**: `PATCH /api/patient/forget-password`
- **Description**: Sends a password reset link to the patient's email.
- **Authorization**: None (for patient only).

### 9. **Reset Password**
- **Endpoint**: `PATCH /api/patient/reset-password/:code`
- **Description**: Resets the patient's password using a reset token.
- **Authorization**: None (for patient only).

## Usage

### 1. Install Dependencies
Make sure to install the necessary dependencies by running the following command:

```bash
npm install
