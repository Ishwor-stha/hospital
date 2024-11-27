const patientModel = require("../models/patientMode")
const emailValidation = require("../utils/emailValidation")
const errorHandling=require("../utils/errorHandling")


//@endPoint:localhost:3000/api/patient/get-patients
module.exports.getAllPatient=async(req,res,next)=>{
    try {
        const patientDetails=await patientModel.find({})
        if(!patientDetails || patientDetails<=0){
            return next(new errorHandling("No patient in database",404))
        }
        res.status(200).json({
            status:true,
            patientDetails
        })
        
    } catch (error) {
        return next(new errorHandling(error.message,error.statusCode||500))
    }
}


// @endpoint:localhost:3000/api/patient/post-patients

module.exports.postPatient = async (req, res, next) => {
    try {
        if(!req.body)  return next(new errorHandling("Empty fields",404));

        if(req.body.email){
            
            
            if(!emailValidation(req.body.email)){
                return next(new errorHandling("Invalid email address",400))
            }
        } 
        
        
        let patientDetails = ["name", "dob", "gender", "phone", "email", "address", "emergency_contact"];
        let toBeUpload = {};
        for (key in req.body) {
            if (patientDetails.includes(key)) {
                toBeUpload[key] = req.body[key];
            }

        }


        const upload = await patientModel.create(toBeUpload);
        res.status(200).json({
            status:true,
            message:`Patient ${upload.name} account created sucessfully `
        })
    } catch (error) {
        return next(new errorHandling(error.message,error.statusCode||500))
    }

}

