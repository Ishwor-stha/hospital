const Router=require("express").Router();
const { checkJwt } = require("../controller/adminAuthController");
// const Router=express.Router()
const {getAllPatient,postPatient,getPatientByPatientId,updatePatient,deletePatient,getPatientByName}=require("../controller/patientController");


Router.route("/get-patients").get(checkJwt,getAllPatient);

Router.route("/post-patient").post(checkJwt,postPatient);

Router.route("/get-patient/:id").get(checkJwt,getPatientByPatientId);

Router.route("/update-patient/:id").patch(checkJwt,updatePatient);

Router.route("/delete-patient/:id").delete(checkJwt,deletePatient);

Router.route("/search").get(checkJwt,getPatientByName);




module.exports=Router;