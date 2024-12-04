const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

//@desc validation
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


//@method:POST
// @endpoint:localhost:3000:/api/doctor/create-report?patientId=****
// @desc:controller to create  medical report by doctor
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


//@method:PATCH
// @endpoint:localhost:3000:/api/doctor/update-report?medicalId=****
// @desc:controller to update  medical report by doctor
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



//@method:DELETE
// @endpoint:localhost:3000:/api/admin/delete-medical-report?medicalId=******
// @desc:controller to delete  medical report by root or doctor
module.exports.deleteMedicalReport=async (req,res,next)=>{
    try {
        if(req.admin.role==="root" || req.admin.role==="admin"){
            const {medicalId}=req.query;
            if(!medicalId)return next(new errorHandling("No medical id is given",400));
            const del=await medicalModel.findByIdAndDelete(medicalId);
            if(!del)return next (new errorHandling("Cannot delete medical report"),400);
            res.status(200).json({
                status:true,
                message:"Medical report deleted sucessfully "
            });
    
        }else{
            return next(new errorHandling("You donot have enough permission to delete a medical record",400));
        }
    } catch (error) {
        return next(new errorHandling(error.message,error.statusCode||500));
    }
}