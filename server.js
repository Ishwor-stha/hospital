const express=require("express");
const dotenv=require("dotenv");




const app=express();
app.use(express.json({limit:"10kb"}));
dotenv.config();
app.get("/",(req,res)=>{
    res.send("helloworld");
    res.send("helloworld");

})

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})