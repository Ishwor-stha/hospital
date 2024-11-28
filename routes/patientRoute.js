const Router=require("express").Router()
// const Router=express.Router()
const {getAllPatient,postPatient,getPatientByPatientId,updatePatient,deletePatient,getPatientByName}=require("../controller/patientController")

Router.route("/get-patients").get(getAllPatient);
Router.route("/post-patient").post(postPatient);
Router.route("/get-patient/:id").get(getPatientByPatientId);
Router.route("/update-patient/:id").patch(updatePatient);
Router.route("/delete-patient/:id").delete(deletePatient)
Router.route("/search").get(getPatientByName)




module.exports=Router