const express = require("express");
const {doctorLogin,updateDoctor}= require("../controller/doctorController.js");
const { checkJwt } = require("../controller/adminAuthController.js");


// Create the router and define the route
const Router = express.Router();

Router.route("/login-doctor").post(doctorLogin);

Router.route("/update-doctor").patch(checkJwt,updateDoctor);




//login
//modify
// router.route("/").post(createPatientRecord);  // Define the GET route

// Export the router using CommonJS syntax
module.exports = Router;
