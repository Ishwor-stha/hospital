const patientModel = require("../models/patientMode");
const emailValidation = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling");
const patientIdValidation = require("../utils/patientIdValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { forgotMessage } = require("../utils/forgetMessage");
const sendMail = require("../utils/sendMail")

//@endPoint:localhost:3000/api/patient/get-patients
//@desc:controller to get all patient 
//@method:GET
module.exports.getAllPatient = async (req, res, next) => {
    try {
        // fetch all paatient data
        if (!["root", "admin", "doctor"].includes(req.admin.role)) return next(new errorHandling("You donot have enough permission to perform this task", 403))
        const patientDetails = await patientModel.find({}, "-__v -password -code_expire -code");
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
        if (!["root", "admin", "doctor"].includes(req.admin.role)) return next(new errorHandling("You donot have enough permission to perform this task", 403))

        // no id on parameter
        if (!req.params.id) return next(new errorHandling("No patient id is provided", 400));
        // from url
        const patientId = req.params.id;
        // validate patient id
        if (!patientIdValidation(patientId)) return next(new errorHandling("Invalid patient Id", 400));
        // fetch patient detail
        const patientDetail = await patientModel.find({ "patient_id": patientId }, "-__v -password -code_expire -code");//exclude __v
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



// @endpoint:localhost:3000/api/patient/create-patients
//@desc:controller to post   patient 
//@method:POST

module.exports.postPatient = async (req, res, next) => {
    try {
        // no body
        if (!req.body) return next(new errorHandling("Empty fields", 400));
        // if email is provided
        if (req.body.email) {

            // email validation
            if (!emailValidation(req.body.email)) {
                return next(new errorHandling("Invalid email address", 400));
            }
        }

        // list all possible keys
        let patientDetails = ["name", "dob", "gender", "phone", "email", "address", "emergency_contact", "password", "confirmPassword"];
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
        // if patient creation fails
        if(!upload ||Object.keys(upload).length<=0) return next(new errorHandling("Cannot Create Patient",500))
        // send response
        res.status(200).json({
            status: true,
            message: `Patient ${upload.name} account created sucessfully `
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }

}

// @endPoint:localhost:3000/api/patient/login-patient
// @method:post
// @desc:controller to login by patient
module.exports.patientLogin = async (req, res, next) => {
    try {
        // extract all keys from req.body on array
        const keys = Object.keys(req.body);
        // if the key length is not equal to 2 or the key is not email and password then send error
        if (keys.length !== 2 || !keys.includes('email') || !keys.includes('password')) {
            return next(new errorHandling("Request body must only contain 'email' and 'password'", 400));
        }
        // destructring the req.body 
        const { email, password } = req.body;
        // validate the email
        if (!emailValidation(email)) return next(new errorHandling("Please enter valid email address", 400));
        // search email on database
        const patient = await patientModel.findOne({ email }, "name email password role");//fetch only name,email and password ,role

        // if no email found then send error
        if (!patient || Object.keys(patient).length <= 0) return next(new errorHandling("No Patient found by this email", 404));
        //  store the password of database
        const dbPassword = patient.password;
        // compare database password with user password
        const isvalid = await bcrypt.compare(password, dbPassword);
        // if password is not valid then throw error
        if (!isvalid) return next(new errorHandling("Password is incorrect", 400));
        // create payload for jwt 
        const payload = {
            adminId: patient._id,
            role: patient.role,
        };
        // create token
        const token = jwt.sign(payload, process.env.jwtSecretKey, { expiresIn: '1h' });
        // send cookie to the browser
        res.cookie("auth_token", token, {
            httpOnly: true, // Makes the cookie accessible only by the server (prevents JavaScript access)
            secure: process.env.NODE_ENV === "production", // Ensures cookies are only sent over HTTPS in production
            expires: new Date(Date.now() + 3600000), // Cookie expires in 1 hour
            sameSite: "Strict" // Restricts the cookie to same-site requests (prevents CSRF attacks)
        });

        // send sucess message

        return res.status(200).json({
            status: true,
            message: `Hello ${patient.name}`
        });

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


// @endpoint localhost:3000/api/patient/update-patient/:id
//@desc:controller to update patient 
//@method:PATCH
module.exports.updatePatient = async (req, res, next) => {
    try {
        // if the user is doctor then throw error (only admin and root user can modify patients details)
        if (req.admin.role !== "patient") return next(new errorHandling("You donot have enough permission to update the details of patient", 403));
        if (!req.admin.adminId) return next(new errorHandling("Patient Id is missing ", 400));
        const id = req.admin.adminId;


        // Ensure that request body is not empty
        if (Object.keys(req.body).length === 0) {
            return next(new errorHandling("No patient detail is given to update", 400));
        }
        if (req.body.email) {
            // validate email
            if (emailValidation(req.body.email)) {
                // check email on database
                const check = await patientModel.find({ "email": req.body.email }, "email");
                // if there is email on data base send error
                if (Object.keys(check).length > 0) return next(new errorHandling("Email already exists", 400));

            } else {
                // if email validation fails
                return next(new errorHandling("Please enter valid email address", 400));
            }
        }
        // possible keys
        let patientDetails = ["name", "dob", "gender", "phone", "email", "address", "emergency_contact", "password", "confirmPassword"];
        let updatedData = {};
        let updateEmergency = {};



        // Fetch the patient from the database using their ID
        const getDetail = await patientModel.findById(id, "emergency_contact");
        // no patient detail
        if (!getDetail) return next(new errorHandling("No patient found", 404));
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
        if (req.body.password) {
            if (req.body.password != req.body.confirmPassword) {
                return next(new errorHandling("Enter valid password", 400));

            } else {
                updatedData["password"] = bcrypt.hashSync(req.body.password, 10)
                updatedData["confirmPassword"] = undefined
            }

        }

        // Update the patient document in the database
        const updatedPatient = await patientModel.findByIdAndUpdate(id, updatedData, { new: true, projection: { name: 1 } });
        if (!updatedPatient) return next(new errorHandling("Error updating Data", 500));

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
        // if user is doctor then throw error  allow only root and admin
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("You donot have enough permission to perform this task", 403))
        // no request data in params
        if (!req.params.id) return next(new errorHandling("No patient id is given", 400));
        // from url
        const id = req.params.id;
        // delete patient 
        const deletePatient = await patientModel.findByIdAndDelete(id);
        if (!deletePatient) return next(new errorHandling("No patient found", 404));
        // send sucess message
        res.status(200).json({
            stauts: true,
            message: `${deletePatient.name} deleted sucessfully`
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }


}
//@endpoint:localhost:3000/api/patient/search
//@method:GET
//@desc:Get patient details by their name or contact
module.exports.getPatientByName = async (req, res, next) => {
    try {
        if (!["root", "admin", "doctor"].includes(req.admin.role)) return next(new errorHandling("You donot have enough permission to perform this task", 403))
        //no query
        if (Object.keys(req.query).length <= 0) return next(new errorHandling("No query is given", 400));
        let searching = {};
        // if name is given on query
        if (req.query.name) searching["name"] = { $regex: req.query.name, $options: "i" };//case inscensitive and finds name similar to given input
        // if contact is given on query

        if (req.query.contact) searching["contact"] = req.query.contact;
        // find detail
        const details = await patientModel.find(searching, "-__v -password -code_expire -code");
        // no details
        if (!details || details <= 0) return next(new errorHandling("No patient found", 404));
        // send response
        res.json({
            message: "sucess",
            details
        });

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

//@endpoint:localhost:3000/api/patient/forget-password
//@method:PATCH
//@desc:Controler to send password reset link to email  
module.exports.forgetPassword = async (req, res, next) => {
    try {
        // destructuring email from req.body object
        const { email } = req.body;
        //email not provided
        if (!email) return next(new errorHandling("Enter email", 400));
        // validate email
        if (!emailValidation(email)) return next(new errorHandling("Enter valid email address", 400));
        // check details on db
        const checkPatient = await patientModel.findOne({ email }, "name")
        // no details on db
        if (!checkPatient || Object.keys(checkPatient).length <= 0) return next(new errorHandling("No user found by this email", 404));
        const code = crypto.randomBytes(16).toString("hex"); // Generate a random code
        const expire = Date.now() + 10 * 60 * 1000; // Current time + 10 minutes in milliseconds
        // update document
        const update = await patientModel.findByIdAndUpdate(checkPatient._id, {
            "code": code,
            "code_expire": expire
        })
        // update fails
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("Something went wrong please try again later", 500));
        // message part
        const siteUrl = process.env.forgotUrlPatient
        const message = forgotMessage(code, siteUrl)
        const subject = "Forget password reset token"
        await sendMail(next, message, subject, update.email, update.name);
        // send response
        res.json({
            status: true,
            message: "Password Code is sent to your email account.The code will expire after 10 minutes "
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


//@endpoint:localhost:3000/api/patient/reset-password/:code
//@method:PATCH
//@desc:Controler to reset password 
module.exports.resetPassword = async (req, res, next) => {
    try {
        //code from url
        const { code } = req.params;
        // check if code is provided on url
        if (!code || Object.keys(req.params).length <= 0) return next(new errorHandling("No token for reseting password", 400));
        // destructuring password and confirmPassword from req.body object
        let { password, confirmPassword } = req.body;
        // if no password or confirm password the send error
        if (!password || !confirmPassword) return next(new errorHandling("Confirm Password or password must match", 400));
        // if confirm password and password doesnot match
        if (confirmPassword !== password) return next(new errorHandling("Confirm Password or password must match", 400));
        // check if code in database
        const dbCode = await patientModel.findOne({ code }, "code_expire");
        // code not found
        if (!dbCode || Object.keys(dbCode).length <= 0) return next(new errorHandling("Reset token is invalid or expire please try again", 400));
        // if the expire code is less than current date
        if (dbCode.code_expire < Date.now()) {
            dbCode.code_expire = undefined;
            dbCode.code = undefined
            await dbCode.save()
            return next(new errorHandling("Reset token is invalid or expire please try again", 400));
        }
        // hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        // update document
        const update = await patientModel.findByIdAndUpdate(dbCode._id, {
            password: hashedPassword,
            confirmPassword: undefined
        }, { new: true });
        // update fail
        if (!update) return next(new errorHandling("Cannot update password try again", 500));
        // set code and code_expire to undefined
        dbCode.code_expire = undefined;
        dbCode.code = undefined
        await dbCode.save()
        // send response
        res.status(200).json({
            status: true,
            message: "Password Updated Sucessfully"
        })


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}