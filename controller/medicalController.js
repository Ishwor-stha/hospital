const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

//@desc validation
module.exports.checkingPatientAndData = async (req, res, next) => {
    try {
        //if user is not doctor throw error
        if (req.admin.role !== "doctor") {
            return next(new errorHandling("You don't have enough permission to create a medical report", 400));
        }
//if the keys on req.body object is zero then throw error 
        if (Object.keys(req.body).length === 0) {
            return next(new errorHandling("Empty body", 404));
        }
// if the req.originalUrl path matches 
        if (req.originalUrl.split("?")[0] === "/api/doctor/create-report") {
            // destructuromg patientId
            const { patientId } = req.query;
            // if there is no patient id then throw error
            if (!patientId) {
                return next(new errorHandling("No PatientId is given in query", 400));
            }
            // search the patient by id
            const patient = await patientModel.findById(patientId, "name");
            // if no patient found then throw error
            if (!patient) {
                return next(new errorHandling("No Patient found by this ID", 404));
            }
            // store the patient object at req.patient object for the use of next controller
            req.patient = patient;
        }
// if the req.originalUrl matches the url
        if (req.originalUrl.split("?")[0] === "/api/doctor/update-report") {
            // destructrue the medical id
            const { medicalId } = req.query;
            // if there is no medical id on the query then throw error
            if (!medicalId) {
                return next(new errorHandling("No medicalId is given in query", 400));
            }
            // searching the medical report from id passes through the query
            const medicalRecord = await medicalModel.findById(medicalId, "patient_id");
            // if there is no medical report in the database then throw error
            if (!medicalRecord) {
                return next(new errorHandling("No medical report found by this ID", 404));
            }
        }
// go to the next controller
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
        //listing only allowed field for filtering from req.body object
        const allowedFields = ["diagnosis", "treatment", "medications"];
        const upload = {};

        // Add allowed fields to the upload object
        for (let key in req.body) {
            if (allowedFields.includes(key)) {
                upload[key] = req.body[key];
            }
        }

        // Add patient and doctor info
        upload["patient_id"] = req.query.patientId;//from url
        upload["doctor_id"] = req.admin.adminId;//from checkJwt controller

        // Create the medical record
        const save = await medicalModel.create(upload);
        // failed to create medical report
        if (!save) {
            return next(new errorHandling("Cannot create medical record", 400));
        }
// send sucess message
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
        // listing only allowed field for filtering 
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
        // if falis to update then throw error
        if (!save) {
            return next(new errorHandling("Cannot update medical record", 400));
        }
// send sucess response
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
        // if user is root or admin then allow 
        if(req.admin.role==="root" || req.admin.role==="admin"){
            // destructruring the medicalId from req.body object
            const {medicalId}=req.query;
            // if there is no medicalId in the req.query object then throw error 
            if(!medicalId)return next(new errorHandling("No medical id is given",400));
            // delete the medical record
            const del=await medicalModel.findByIdAndDelete(medicalId);
            // if the deletiion fails then throw error 
            if(!del)return next (new errorHandling("Cannot delete medical report"),400);
            // send sucess resposne
            res.status(200).json({
                status:true,
                message:"Medical report deleted sucessfully "
            });
    
        }else{
            // if user is not root or admin then throw error 
            return next(new errorHandling("You donot have enough permission to delete a medical record",400));
        }
    } catch (error) {
        return next(new errorHandling(error.message,error.statusCode||500));
    }
}