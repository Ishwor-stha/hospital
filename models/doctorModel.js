const mongoose = require('mongoose');
const emailValidation=require("../utils/emailValidation")

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
        match: [emailValidation(this.email), "Please enter a valid email address"]
    },

    // Availability Schedule (Optional)
    availability: {
        type: [String], // Example: ['Monday 9am-12pm', 'Wednesday 2pm-5pm']
        default: [],
    },
    password:{
        type:String,
        require:[true,"password is missing"],
        min:[8,"Password should be in minimum of eight characters"]

    },
    confirmPassword:{
        type:String,
        require:[true,"Confirm password is missing"],
        validate:{
            validator:function(confirmPassword){
                return this.password===confirmPassword
            }
        },
        message:"Confirm password and password should match"
    },
    role:{
        type:String,
        enum:["doctor"],
        default:Doctor
    }

    
});


// Create and export the model
const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
