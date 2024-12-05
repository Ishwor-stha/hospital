const mongoose = require('mongoose');
const emailValidation = require("../utils/emailValidation");
const bcrypt = require("bcryptjs");

// Define the Doctor Schema
const doctorSchema = mongoose.Schema({
    // Doctor's Unique ID
    doctorId: {
        type: String,
        default: function () {
            return `D${Date.now()}`; // Generate a unique ID based on the timestamp
        },
        unique: true,
    },

    // Doctor's Name
    name: {
        type: String,
        required: [true, "Doctor's name is required"],
        maxlength: [50, "Doctor's name must not exceed 50 characters"],
        trim: true

    },

    // Department
    department: {
        type: String,
        required: [true, "Department is required"],
    },

    // Specialization
    specialization: {
        type: String,
        required: [true, "Specialization is required"],
    },

    // Years of Experience
    experience: {
        type: Number,
        required: [true, "Years of experience is required"],
        min: [0, "Experience cannot be negative"],
    },

    // Contact Information
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"], // Regex for 10 digits
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,

        validate: {
            validator:function(email){
                return emailValidation(email);
            },
            message: "Please enter a valid email address",
        },
    },

    // Availability Schedule (Optional)
    availability: {
        type: [String], // Example: ['Monday 9am-12pm', 'Wednesday 2pm-5pm']
        default: [],
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
    },

    confirmPassword: {
        type: String,
        required: [true, "Confirm password is required"],
        validate: {
            validator: function (confirmPassword) {
                return this.password === confirmPassword;
            },
            message: "Passwords must match",
        },
    },

    role: {
        type: String,
        enum: ["doctor"],
        default: "doctor",
    },
});

// Middleware: Pre-save Hook
doctorSchema.pre("save", async function (next) {
    try {
        
     
        // Hash password if modified
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
            this.confirmPassword = undefined; // Remove confirmPassword field after validation
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Create and export the model
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
