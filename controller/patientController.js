const patientModel = require("../models/patientMode")
const emailValidation = require("../utils/emailValidation")
const errorHandling = require("../utils/errorHandling")
const patientIdValidation = require("../utils/patientIdValidation")


//@endPoint:localhost:3000/api/patient/get-patients
//@desc:controller to get all patient 
//@method:GET
module.exports.getAllPatient = async (req, res, next) => {
    try {
        // fetch all paatient data
        const patientDetails = await patientModel.find({})
        // no patient
        if (!patientDetails || patientDetails <= 0) {
            return next(new errorHandling("No patient in database", 404));
        }
        // send responsne
        res.status(200).json({
            status: true,
            patientDetails
        });

    } catch (error) {

        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


// @endpoint:localhost:3000/api/patient/get-patient/:id
//@desc:controller to get  patient  by patient id
//@method:GET
module.exports.getPatientByPatientId = async (req, res, next) => {
    try {
        // no id on parameter
        if (!req.params.id) return next(new errorHandling("No patient id is provided", 404));
    // from url
        const patientId = req.params.id;
        // validate patient id
        if (!patientIdValidation(patientId)) return next(new errorHandling("Invalid patient Id", 404));
        // fetch patient detail
        const patientDetail = await patientModel.find({ "patient_id": patientId }, "-__v");//exclude __v
        // no patient detail
        if (!patientDetail || patientDetail <= 0) return next(new errorHandling("Cannot find patient", 404));

// send detail
        res.status(200).json({
            status: true,
            patientDetail
        }
        );



    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}



// @endpoint:localhost:3000/api/patient/post-patients
//@desc:controller to post   patient 
//@method:POST

module.exports.postPatient = async (req, res, next) => {
    try {
        // no body
        if (!req.body) return next(new errorHandling("Empty fields", 404));
// if email is provided
        if (req.body.email) {

            // email validation
            if (!emailValidation(req.body.email)) {
                return next(new errorHandling("Invalid email address", 400))
            }
        }

        // list all possible keys
        let patientDetails = ["name", "dob", "gender", "phone", "email", "address", "emergency_contact"];
        let toBeUpload = {};
        // iterate through req.body
        for (key in req.body) {
            // key is present in req.body
            if (patientDetails.includes(key)) {
                toBeUpload[key] = req.body[key];
            }

        }

// upload data
        const upload = await patientModel.create(toBeUpload);
        // send response
        res.status(200).json({
            status: true,
            message: `Patient ${upload.name} account created sucessfully `
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }

}

// @endpoint localhost:3000/api/patient/update-patient/:id
//@desc:controller to update patient 
//@method:PATCH
module.exports.updatePatient = async (req, res, next) => {
    try {
        // Ensure that request body is not empty
        if (Object.keys(req.body).length === 0) {
            return next(new errorHandling("No patient detail is given to update", 400));
        }
// possible keys
        let patientDetails = ["name", "dob", "gender", "phone", "email", "address", "emergency_contact"];
        let updatedData = {};
        let updateEmergency = {};

        const id = req.params.id;

        // Fetch the patient from the database using their ID
        const getDetail = await patientModel.findById(id);
        // no patient detail
        if (!getDetail) return next(new errorHandling("No patient found", 400));
// 
        const dbEmergencyContact = getDetail.emergency_contact; // Existing emergency contact data

        // If emergency_contact is provided in the update request
        if (req.body.emergency_contact) {
            // Iterate through the provided emergency_contact data to update it
            for (let key in req.body.emergency_contact) {
                if (["name", "relationship", "phone"].includes(key)) {
                    updateEmergency[key] = req.body.emergency_contact[key];
                }
            }

            // Ensure that missing fields fall back to the existing database values
            if (!updateEmergency.relationship) {
                updateEmergency.relationship = dbEmergencyContact.relationship;
            }
            if (!updateEmergency.phone) {
                updateEmergency.phone = dbEmergencyContact.phone;
            }
            if (!updateEmergency.name) {
                updateEmergency.name = dbEmergencyContact.name;
            }
        }

        // Loop through the request body and update the patient details
        for (let key in req.body) {
            if (patientDetails.includes(key)) {
                if (key === "emergency_contact") {
                    updatedData[key] = updateEmergency;  // Assign the updated emergency_contact
                } else {
                    updatedData[key] = req.body[key];
                }
            }
        }

        // Update the patient document in the database
        const updatedPatient = await patientModel.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedPatient) return next(new errorHandling("Error updating Data", 400))

        // Return the success response with updated patient details
        res.status(200).json({
            status: true,
            message: "Patient updated successfully",
            data: updatedPatient
        });

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

// @endpoint:localhost:3000/api/patient/delete-patient/:id
//@desc:controller to delete  patient 
//@method:DELETE

module.exports.deletePatient = async (req, res, next) => {
    try {
        // no request data in params
        if (!req.params.id) return next(new errorHandling("No patient id is given", 400));
        // from url
        const id = req.params.id;
        // delete patient 
        const deletePatient = await patientModel.findByIdAndDelete(id);
        if (!deletePatient) return next(new errorHandling("No patient found", 404));

        res.status(200).json({
            stauts: true,
            message: `${deletePatient.name} deleted sucessfully`
        });
    } catch (error) {
            return next(new errorHandling(error.message,error.statusCode||500))
    }


}
//@endpoint:localhost:3000/api/patient/search
//@method:GET
//@desc:Get patient details by their name or contact

module.exports.getPatientByName=async(req,res,next)=>{
    try{
        //no query
        if(Object.keys(req.query).length<=0) return next(new errorHandling("No query is given",404))
        let searching={}
    
        if(req.query.name) searching["name"]={ $regex: req.query.name, $options: "i" };//case inscensitive and finds name similar to given input
        if(req.query.patientId) searching["contact"]=req.query.contact;
        // find detail
        const details=await patientModel.find(searching)
        // no details
        if(!details ||details<=0) return next(new errorHandling("No patient found",404))
            // send response
        res.json({
            message:"sucess",
            details
        })

    }catch(error){
        return next(new errorHandling(error.message,error.statusCode||500))
    }
}