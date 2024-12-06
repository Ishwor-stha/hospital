const Router=require("express").Router();
const { checkJwt } = require("../controller/adminAuthController");
// const Router=express.Router()
const {getAllPatient,postPatient,getPatientByPatientId,updatePatient,deletePatient,getPatientByName,patientLogin}=require("../controller/patientController");
const {createAppointment,viewPatientAppointment}=require("../controller/appointmentControlelr");



Router.route("/get-patients").get(checkJwt,getAllPatient);

Router.route("/create-patient").post(checkJwt,postPatient);

Router.route("/get-patient/:id").get(checkJwt,getPatientByPatientId);

Router.route("/login-patient").post(patientLogin)

Router.route("/update-patient").patch(checkJwt,updatePatient);

Router.route("/create-appointment").post(checkJwt,createAppointment);//check

Router.route("/view-appointment").get(checkJwt,viewPatientAppointment);//check

Router.route("/delete-patient/:id").delete(checkJwt,deletePatient);

Router.route("/search").get(checkJwt,getPatientByName);




module.exports=Router;