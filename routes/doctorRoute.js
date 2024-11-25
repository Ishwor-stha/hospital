const express = require("express");
const {doctorCheck}= require("../controller/doctorController.js");

// Create the router and define the route
const router = express.Router();

router.route("/").get(doctorCheck);  // Define the GET route

// Export the router using CommonJS syntax
module.exports = router;
