const express = require("express");
const {doctorLogin,updateDoctor,getDoctors}= require("../controller/doctorController.js");
const { checkJwt } = require("../controller/adminAuthController.js");
const {checkingPatientAndData,createReport,updateReport}=require("../controller/medicalController.js")
const{approveAppointment,rejectAppointment}=require("../controller/appointmentControlelr.js")

// Create the router and define the route
const Router = express.Router();

Router.route("/login-doctor").post(doctorLogin);

Router.route("/update-doctor").patch(checkJwt,updateDoctor);

Router.route("/create-report").post(checkJwt,checkingPatientAndData,createReport);

Router.route("/update-report").patch(checkJwt,checkingPatientAndData,updateReport);

Router.route("/get-doctors").get(getDoctors);

Router.route("/approve-appointment").patch(checkJwt,approveAppointment);

Router.route("/reject-appointment").patch(checkJwt,rejectAppointment);


// router.route("/").post(createPatientRecord);  // Define the GET route






// Export the router using CommonJS syntax
module.exports = Router;
