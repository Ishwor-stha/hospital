const express=require("express")
const dotenv=require("dotenv");
const doctorRoute=require("./routes/doctorRoute")
const dbConnection=require("./utils/mongodb")
const errorController=require("./controller/errorController")
const patientRouter=require("./routes/patientRoute");
const logoutRoute=require("./routes/logOutRoute")
const adminRoute=require("./routes/adminRoutes")
const errorHandling = require("./utils/errorHandling");
const cookieParser=require("cookie-parser")





const app=express();
dotenv.config();
app.use(cookieParser())
app.use(express.json({limit:"10kb"}));


dbConnection();
app.use("/api",logoutRoute)
app.use("/api/doctor",doctorRoute);
app.use("/api/patient",patientRouter);
app.use("/api/admin",adminRoute);





app.all("*",(req,res,next)=>{
  next(new errorHandling("Url Path Is Not Found",404))
});

app.use(errorController);
app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
    console.log(  `App is running on ${process.env.NODE_ENV} mode`);
})