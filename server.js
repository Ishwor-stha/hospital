const express=require("express")
const dotenv=require("dotenv");
const doctorRoute=require("./routes/doctorRoute")
const dbConnection=require("./utils/mongodb")





const app=express();
dotenv.config()
app.use(express.json({limit:"10kb"}));


dbConnection()
app.use("/api/doctor",doctorRoute)


app.all("*",(req,res,next)=>{
    res.status(404).json({
        status:false,
        message:"Url Path Is Not Found"
    })
})
app.listen(process.env.PORT||3000,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
    console.log(  `App is running on ${process.env.NODE_ENV} mode`)
})