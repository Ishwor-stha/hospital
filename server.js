const express=require("express")
const dotenv=require("dotenv");
const doctorRoute=require("./routes/doctorRoute")



dotenv.config()
const app=express();
app.use(express.json({limit:"10kb"}));

app.use("/api/doctor",doctorRoute)
app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
    console.log(  `App is running on ${process.env.NODE_ENV} mode`)
})