const medicalModel = require("../models/medicalRecord");
const patientModel = require("../models/patientMode");
const errorHandling = require("../utils//errorHandling");

module.exports.checkingPatientAndData = async (req, res, next) => {
    if (req.admin.role !== "doctor") return next(new errorHandling("You donot have enough permission to create a medical report", 400));
    if (Object.keys(req.body).length <= 0) return next(new errorHandling("Empty body", 404));
    if (Object.keys(req.query.patientId).length <= 0) return next(new errorHandling("No Patient id is given on query", 400));
    const id = req.query.patientId;
    const check = await patientModel.findById(id, "name");
    req.patientId = check.name;
    if (!check || Object.keys(check).length <= 0) return next(new errorHandling("No Patient is found by this ID", 404));
    next();
}
//create report '
module.exports.createReport = async (req, res, next) => {
    let possibleFields = ["diagnosis", "treatment", "medications"];
    let upload = {};
    for (keys in req.body) {
        if (possibleFields.includes(keys)) {
            upload[key] = req.body[key];
        }
    }
    upload["patient_id"] = req.query.patientId;
    upload["doctor_id"] = req.admin._id;

    const save = await medicalModel.create(upload);
    if (!save || Object.keys(save).length <= 0) return next(new errorHandling("Cannot create medical record", 400));
    res.status(200).json({
        status: true,
        message: `${req.patientId}'s medical report created sucessfully`
    });


}

//update report
//deletereport