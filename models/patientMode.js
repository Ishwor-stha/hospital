const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")

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
    password: {
        type: String,
        minlength: [8, "Minimum password length must be 8 characters"],
        required: [true, "Password field is missing"],
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm password field is missing"],
        validate: {
            validator: function (confirmPassword) {
                return confirmPassword === this.password;
            },
            message: "Password and Confirm password must be the same",
        }
    },
    role: {
        type: String,
        enum: "patient",
        default: "patient"
    },

    // Date of Registration (automatically generated)
    registration_date: {
        type: Date,
        default: Date.now
    },




});
patientSchema.pre("save", async function (next) {
    // Check if the email already exists in the database
    const existingPatient = await mongoose.model("Patient").findOne({ email: this.email });

    if (existingPatient) {
        const error = new Error("Email already exists");
        return next(error); // Reject save if email exists
    }

    // If the password is modified, hash it before saving
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, 10);
        this.confirmPassword = undefined; // Remove confirmPassword after hashing
    }

    next();
});

// Create and export the model
const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
