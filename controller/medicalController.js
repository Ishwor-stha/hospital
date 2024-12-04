const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

module.exports.checkingPatientAndData = async (req, res, next) => {
    try {
        if (req.admin.role !== "doctor") return next(new errorHandling("You donot have enough permission to create a medical report", 400));
        if (Object.keys(req.body).length <= 0) return next(new errorHandling("Empty body", 404));
        if(Object.keys(req.query).length>1) return next(new errorHandling("Not authorized to pass more than one query",404));
        if ( !Object.keys(req.query).includes("patientId") || Object.keys(req.query.patientId).length <= 0) return next(new errorHandling("No PatientId is given on query", 400));
        const id = req.query.patientId;
        const check = await patientModel.findById(id, "name");
        if (!check || Object.keys(check).length <= 0) return next(new errorHandling("No Patient is found by this ID", 404));
        req.patientId = check.name;
        next();
    } catch (error) {
        return next(new errorHandling(error.message, error.stautsCode || 500));
    }
}

//create report '
module.exports.createReport = async (req, res, next) => {
    try {
        let allowedFields = ["diagnosis", "treatment", "medications"];
        let upload = {};
        for (keys in req.body) {
            if (allowedFields.includes(keys)) {
                upload[keys] = req.body[keys];
            }
        }
        
        upload["patient_id"] = req.query.patientId;
        upload["doctor_id"] = req.admin.adminId;
        

        const save = await medicalModel.create(upload);
        if (!save || Object.keys(save).length <= 0) return next(new errorHandling("Cannot create medical record", 400));
        res.status(200).json({
            status: true,
            message: `${req.patientId}'s medical report created sucessfully`
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.stautsCode || 500));
    }


}

//update report
//deletereport