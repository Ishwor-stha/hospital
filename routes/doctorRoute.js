const express = require("express");
const {createPatientRecord}= require("../controller/doctorController.js");

// Create the router and define the route
const router = express.Router();



//login
//modify
// router.route("/").post(createPatientRecord);  // Define the GET route

// Export the router using CommonJS syntax
module.exports = router;
