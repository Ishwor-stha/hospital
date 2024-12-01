const { getAdmin,createAdmin,adminLogin,checkJwt,logoutAdmin ,deleteAdmin,updateAdmin,updateAdminByRoot} = require("../controller/adminAuthController")


const Router=require("express").Router()
Router.route("/get-admin").get(checkJwt,getAdmin)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("/login-admin").post(adminLogin)
Router.route("/logout-admin").delete(checkJwt,logoutAdmin)
Router.route("/delete-admin/:id").delete(checkJwt,deleteAdmin)
Router.route("/update-admin").patch(checkJwt,updateAdmin)
Router.route("/update-admin-root/:id").patch(checkJwt,updateAdminByRoot)





module.exports=Router