const Router=require("express").Router()
// const Router=express.Router()
const {getAllPatient,postPatient}=require("../controller/patientController")

Router.route("/get-patients").get(getAllPatient)
Router.route("/post-patient").post(postPatient)



module.exports=Router