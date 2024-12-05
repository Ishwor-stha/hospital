const mongoose = require('mongoose');
const emailValidation = require("../utils/emailValidation");

const appointmentSchema = new mongoose.Schema({
    patient_name: {
        type: String,
        required: [true, "Patient name is required"],
        trim: true

    },
    patient_email: {
        type: String,
        required: [true, "Patient email is required"],
        lowercase: true,
        validate: {
            validator: function (value) {
                return emailValidation(value)
            },
            message: "Please enter valid email address"
        }
    },
    patient_phone: {
        type: String,
        required: [true, "Patient phone number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"] // Regex for 10 digits

    },
    doctor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true,
    },
    appointment_date: {
        type: Date,
        required: [true, "Appointment date is required"],
        validate: {
            validator: function (value) {
                return value > Date.now();
            },
            message: "Appointment date must be in the future",
        }

    },
    reason: {
        type: String,
        maxlength: [500, "Reason for the appointment must not exceed 500 characters"],
    },
    appointment_status: {
        status: {
            type: String,
            enum: ["pending", "rejected", "approved"],
            default: "pending"
        },
        time: {
            type: String,

        },
        date: {
            type: Date
        },
        reason_for_rejection: {
            type: String,
            max: [500, "Rejection message excceds 500 letters"]
        }

    },
    created_at: {
        type: Date,
        default: Date.now
    },
});

// Automatically delete expired appointments
appointmentSchema.index({ appointment_date: 1 }, { expireAfterSeconds: 0 });
const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;



