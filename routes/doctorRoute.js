const express = require("express");
const {doctorLogin,updateDoctor,getDoctors,forgetPassword,resetPassword}= require("../controller/doctorController.js");
const { checkJwt } = require("../controller/adminAuthController.js");
const {checkingPatientAndData,createReport,updateReport}=require("../controller/medicalController.js")
const{approveAppointment,rejectAppointment,viewDoctorAppointment}=require("../controller/appointmentControlelr.js")

const Router = express.Router();

Router.route("/login-doctor").post(doctorLogin);

Router.route("/forget-password/").patch(forgetPassword);

Router.route("/reset-password/:code").patch(resetPassword)

Router.route("/update-doctor").patch(checkJwt,updateDoctor);

Router.route("/create-report").post(checkJwt,checkingPatientAndData,createReport);

Router.route("/update-report").patch(checkJwt,checkingPatientAndData,updateReport);

Router.route("/get-doctors").get(getDoctors);

Router.route("/view-appointment").get(checkJwt,viewDoctorAppointment);

Router.route("/approve-appointment").patch(checkJwt,approveAppointment);

Router.route("/reject-appointment").patch(checkJwt,rejectAppointment);




module.exports = Router;
