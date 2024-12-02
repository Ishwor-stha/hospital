const express = require("express");
const {logoutAdmin,checkJwt}=require("../controller/adminAuthController")


// Create the router and define the route
const Router = express.Router();

Router.route("/logout").delete(checkJwt,logoutAdmin)





module.exports = Router;
