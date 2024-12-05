const Router=require("express").Router();
const {createAppointment,approveAppointment}=require("../controller/appointmentControlelr");

Router.route("/create-appointment").post(createAppointment);


module.exports=Router;