const Router = require("express").Router();
const { checkJwt } = require("../controller/adminAuthController");
// const Router=express.Router()
const { getAllPatient, postPatient, getPatientByPatientId, updatePatient, deletePatient, getPatientByName, patientLogin, forgetPassword, resetPassword } = require("../controller/patientController");
const { createAppointment, viewPatientAppointment } = require("../controller/appointmentControlelr");
const{viewSpecificMedicalReport}=require("../controller/medicalController");
const {upload}=require("../utils/imageHandling");



Router.route("/get-patients").get(checkJwt, getAllPatient);

Router.route("/create-patient").post(checkJwt, upload.single('photo'),postPatient);

Router.route("/get-patient/:id").get(checkJwt, getPatientByPatientId);

Router.route("/login-patient").post(patientLogin)

Router.route("/reset-password/:code").patch(resetPassword)

Router.route("/forgot-password").patch(forgetPassword)

Router.route("/update-patient").patch(checkJwt,upload.single('photo'), updatePatient);

Router.route("/create-appointment").post(checkJwt, createAppointment);

Router.route("/view-appointment").get(checkJwt, viewPatientAppointment);

Router.route("/delete-patient/:id").delete(checkJwt, deletePatient);

Router.route("/view-report").get(checkJwt,viewSpecificMedicalReport);

Router.route("/search").get(checkJwt, getPatientByName);




module.exports = Router;