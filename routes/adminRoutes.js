const { getAdmin,createAdmin,adminLogin,checkJwt,logoutAdmin ,deleteAdmin,updateAdmin,updateAdminByRoot,forgetPassword,resetPassword} = require("../controller/adminAuthController");
const{createDoctor,modifyDoctor,deleteDoctor,getDoctors,getDoctorByPhoneOrName}=require("../controller/doctorController");
const{deleteMedicalReport}=require("../controller/medicalController");
const{deleteAppointment,viewAppointments}=require("../controller/appointmentControlelr");


const Router=require("express").Router();

Router.route("/get-admin").get(checkJwt,getAdmin);

Router.route("/create-admin").post(checkJwt,createAdmin);

Router.route("/login-admin").post(adminLogin);

// Router.route("/logout-admin").delete(checkJwt,logoutAdmin);

Router.route("/delete-admin/:id").delete(checkJwt,deleteAdmin);

Router.route("/update-admin").patch(checkJwt,updateAdmin);

Router.route("/update-admin-root/:id").patch(checkJwt,updateAdminByRoot);

// Router.route("/get-doctors").get(checkJwt,getDoctors);

Router.route("/get-doctorByID").get(checkJwt,getDoctorByPhoneOrName);

Router.route("/create-doctor").post(checkJwt,createDoctor);

Router.route("/update-doctor/:id").patch(checkJwt,modifyDoctor);

Router.route("/delete-doctor/:id").delete(checkJwt,deleteDoctor);

Router.route("/delete-medical-report").delete(checkJwt,deleteMedicalReport);

Router.route("/delete-appointment").delete(checkJwt,deleteAppointment);

Router.route("/view-appointments").get(checkJwt,viewAppointments);

Router.route("/forget-password").patch(forgetPassword)

Router.route("/reset-password/:code").patch(resetPassword)



module.exports=Router;