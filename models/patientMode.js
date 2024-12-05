const mongoose = require('mongoose');

// Define the Patient Schema
const patientSchema = mongoose.Schema({
    // Patient's Name
    name: {
        type: String,
        required: [true, "Patient Name is Required"],
        maxlength: [50, "Patient name must not exceed 50 characters"]
    },

    // Patient's Unique ID (e.g., generated from timestamp)
    patient_id: {
        type: String,
        default: function () {
            return `P${Date.now()}`;  // Generate a unique ID based on the current timestamp
        },
        unique: true,  // Ensure this is unique
    },

    // Patient's Date of Birth
    dob: {
        type: Date,
        required: [true, "Date of Birth is required"],
    },

    // Patient's Gender
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],  // Restrict to a predefined set of values
        required: [true, "Gender is required"]
    },

    // Contact Information
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],  // Simple regex for 10 digits
    },

    email: {
        type: String,
        unique: true,  // Ensure email is unique
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Please enter a valid email address"],  // Basic regex for email
        lowercase: true,
        trim: true

    },

    // Address Details
    address: {
        type: String,
        required: [true, "Address is missing"]
    },

    // Emergency Contact Information
    emergency_contact: {
        name: {
            type: String,
            required: [true, "Emergency contact name is required"],
            trim: true

        },
        relationship: {
            type: String,
            required: [true, "Relationship to patient is required"]
        },
        phone: {
            type: String,
            required: [true, "Emergency contact phone is required"],
            match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
        }
    },

    // Date of Registration (automatically generated)
    registration_date: {
        type: Date,
        default: Date.now
    },




});

// Create and export the model
const Patient = mongoose.model('Patients', patientSchema);

module.exports = Patient;
