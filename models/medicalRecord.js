const mongoose = require('mongoose');

const medicalRecordSchema = mongoose.Schema({
    // Reference to the Patient
    patient_id: {
        type: String,
        required: [true, "Patient ID is required"],
        ref: "Patients, // Establishes a relationship with the Patient model
    },

    // Date of the Record
    record_date: {
        type: Date,
        default: Date.now, // Automatically set to the current date
    },

    // Doctor's Information
    doctor: {
        type: String,
        doctorId: [true, "Doctor id is missing"],
        ref: "Doctor"
    },

    // Diagnosis Details
    diagnosis: {
        type: String,
        required: [true, "Diagnosis details are required"],
        maxlength: [500, "Diagnosis must not exceed 500 characters"],
    },

    // Treatment Plan
    treatment: {
        type: String,
        required: [true, "Treatment details are required"],
        maxlength: [1000, "Treatment details must not exceed 1000 characters"],
    },

    // Medications Prescribed
    medications: [
        {
            name: {
                type: String,
                required: [true, "Medication name is required"],
            },
            dosage: {
                type: String,
                required: [true, "Dosage information is required"],
            },
            frequency: {
                type: String,
                required: [true, "Frequency information is required"],
            },
        },
    ],

    // Notes (Optional)




});

// Create and export the model
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
