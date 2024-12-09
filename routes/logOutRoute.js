const express = require("express");
const { logoutAdmin, checkJwt } = require("../controller/adminAuthController");



const Router = express.Router();

Router.route("/logout").delete(checkJwt, logoutAdmin);





module.exports = Router;
