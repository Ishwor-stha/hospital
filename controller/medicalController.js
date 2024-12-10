const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

//@desc validation
module.exports.checkingPatientAndData = async (req, res, next) => {
    try {
        //if user is not doctor throw error
        if (req.admin.role !== "doctor")return next(new errorHandling("This task is restricted for authorized users only.", 403));
        //if the keys on req.body object is zero then throw error 
        if (Object.keys(req.body).length === 0)return next(new errorHandling("Empty request body: Ensure you're sending the correct information.", 400));
        // if the req.originalUrl path matches 
        if (req.originalUrl.split("?")[0] === "/api/doctor/create-report") {
            // destructuromg patientId
            const { patientId } = req.query;
            // if there is no patient id then throw error
            if (!patientId)return next(new errorHandling("Empty patient id on query: Ensure you're sending the correct information.", 400));
            // search the patient by id
            const patient = await patientModel.findById(patientId, "name");
            // if no patient found then throw error
            if (!patient) return next(new errorHandling("No patient record found for the provided ID. Please check and try again.", 404));
            // store the patient object at req.patient object for the use of next controller
            req.patient = patient;
        }
        // if the req.originalUrl matches the url
        if (req.originalUrl.split("?")[0] === "/api/doctor/update-report") {
            // destructrue the medical id
            const { medicalId } = req.query;
            // if there is no medical id on the query then throw error
            if (!medicalId) return next(new errorHandling("Empty medical id on query: Ensure you're sending the correct information.", 400));
            // searching the medical report from id passes through the query
            const medicalRecord = await medicalModel.findById(medicalId, "patient_id");
            // if there is no medical report in the database then throw error
            if (!medicalRecord) return next(new errorHandling("No medical record found for the provided ID. Please check and try again.", 404));
        }
        // go to the next controller
        next();
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
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
        if (!save) return next(new errorHandling("Creation of medical report was not successful. Please retry.", 500));
        // send sucess message
        res.status(200).json({
            status: true,
            message: `${req.patient.name}'s medical report created successfully,`
        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));   }
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
        if (!save) return next(new errorHandling("Cannot update medical record. Please retry.", 500));
        // send sucess response
        res.status(200).json({
            status: true,
            message: "Medical report updated successfully."
        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));    }
}


//@method:DELETE
// @endpoint:localhost:3000:/api/admin/delete-medical-report?medicalId=******
// @desc:controller to delete  medical report by root or doctor
module.exports.deleteMedicalReport = async (req, res, next) => {
    try {
        // if user is root or admin then allow 
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("You donot have enough permission to delete a medical record", 403));
        // destructruring the medicalId from req.body object
        const { medicalId } = req.query;
        // if there is no medicalId in the req.query object then throw error 
        if (!medicalId) return next(new errorHandling("Empty medical id query: Ensure you're sending the correct information.", 400));
        // delete the medical record
        const del = await medicalModel.findByIdAndDelete(medicalId);
        // if the deletiion fails then throw error 
        if (!del) return next(new errorHandling("Medical Report was not deleted. Please retry."), 500);
        // send sucess resposne
        res.status(200).json({
            status: true,
            message: "Medical report deleted sucessfully."
        });


    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));  }
}

//@method:DELETE
// @endpoint:localhost:3000:/api/admin/view-medical-report
// @desc:controller to view  medical report by root or admin
module.exports.viewMedicalReport = async (req, res, next) => {
    try {
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403));
        const view = await medicalModel.find();
        if (!view || Object.keys(view).length <= 0) return next(new errorHandling("No medical report record found in the database.", 404));
        res.status(200).json({
            status: true,
            medicalReport: view
        })
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
}

//@method:DELETE
// @endpoint:localhost:3000:/api/doctor/view-report
// @desc:controller to delete  medical report by doctor or patient
module.exports.viewSpecificMedicalReport = async (req, res, next) => {
    try {
        if (!["doctor","patient"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403));
        const ID = req.admin.adminId;
        if(!ID || Object.keys(ID).length<=0)return next(new errorHandling("Empty id of user: Ensure you're logged in.",400));
        let view; 
        if(req.admin.role==="doctor")view= await medicalModel.find({ doctor_id: ID });
        if(req.admin.role==="patient")view= await medicalModel.find({ patient_id: ID });
        if (!view || Object.keys(view).length <= 0) return next(new errorHandling("No medical report record found in the database.", 404));
        res.status(200).json({
            status: true,
            medicalReport: view
        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500)); }
}