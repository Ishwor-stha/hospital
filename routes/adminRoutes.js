const { getAdmin,createAdmin,adminLogin,checkJwt,logoutAdmin ,deleteAdmin} = require("../controller/adminAuthController")


const Router=require("express").Router()
Router.route("/get-admin").get(checkJwt,getAdmin)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("/login-admin").post(adminLogin)
Router.route("/logout-admin").delete(checkJwt,logoutAdmin)
Router.route("/delete-admin/:id").delete(checkJwt,deleteAdmin)





module.exports=Router