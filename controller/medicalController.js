const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

module.exports.checkingPatientAndData = async (req, res, next) => {
    try {
        if (req.admin.role !== "doctor") {
            return next(new errorHandling("You don't have enough permission to create a medical report", 400));
        }
        
        if (Object.keys(req.body).length === 0) {
            return next(new errorHandling("Empty body", 404));
        }

        if (req.originalUrl.split("?")[0] === "/api/doctor/create-report") {
            const { patientId } = req.query;
            if (!patientId) {
                return next(new errorHandling("No PatientId is given in query", 400));
            }
            const patient = await patientModel.findById(patientId, "name");
            if (!patient) {
                return next(new errorHandling("No Patient found by this ID", 404));
            }
            req.patient = patient;
        }

        if (req.originalUrl.split("?")[0] === "/api/doctor/update-report") {
            const { medicalId } = req.query;
            if (!medicalId) {
                return next(new errorHandling("No medicalId is given in query", 400));
            }
            const medicalRecord = await medicalModel.findById(medicalId, "patient_id");
            if (!medicalRecord) {
                return next(new errorHandling("No medical report found by this ID", 404));
            }
        }

        next();
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};


//create report '
module.exports.createReport = async (req, res, next) => {
    try {
        const allowedFields = ["diagnosis", "treatment", "medications"];
        const upload = {};

        // Add allowed fields to the upload object
        for (let key in req.body) {
            if (allowedFields.includes(key)) {
                upload[key] = req.body[key];
            }
        }

        // Add patient and doctor info
        upload["patient_id"] = req.query.patientId;
        upload["doctor_id"] = req.admin.adminId;

        // Create the medical record
        const save = await medicalModel.create(upload);
        if (!save) {
            return next(new errorHandling("Cannot create medical record", 400));
        }

        res.status(200).json({
            status: true,
            message: `${req.patient.name}'s medical report created successfully`
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};


//update report
module.exports.updateReport = async (req, res, next) => {
    try {
        const allowedFields = ["diagnosis", "treatment", "medications"];
        const upload = {};

        // Add allowed fields to the upload object
        for (let key in req.body) {
            if (allowedFields.includes(key)) {
                upload[key] = req.body[key];
            }
        }

        // Update the medical record
        const save = await medicalModel.findByIdAndUpdate(req.query.medicalId, upload, { new: true });
        if (!save) {
            return next(new errorHandling("Cannot update medical record", 400));
        }

        res.status(200).json({
            status: true,
            message: "Medical report updated successfully"
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}



//deletereport