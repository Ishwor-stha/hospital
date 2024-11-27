const mongoose = require('mongoose');

const medicalHistorySchema = mongoose.Schema({
    diagnosis: {
        type: String,
        required: [true, "Diagnosis is required"],
        maxlength: [200, "Diagnosis must not exceed 200 characters"]
    },
    medications: {
        type: [String],  // Array of medication names
        required: [true, "Medications are required"]
    },
    treatments: {
        type: [String],  // Array of treatments
        required: [true, "Treatments are required"]
    },
    date: {
        type: Date,
        required: [true, "Date of diagnosis is required"]
    }
});

// Create and export the model
const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory;
