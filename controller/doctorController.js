const doctorModel = require("../models/doctorModel");
const emailValidation = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const crypto = require("crypto")
const { forgotMessage } = require("../utils/forgetMessage");
const sendMail = require("../utils/sendMail")
const fs = require('fs');
const path = require("path")

const deleteImage = (fileName) => {
    const rootPath = path.dirname(require.main.filename);
    const deletePath = `${rootPath}/${fileName}`
    fs.rmSync(deletePath);

}

// @method:GET 
// @endpoint:localhost:3000/api/admin/get-doctors
// @desc:Controller to get all doctor presented on database
module.exports.getDoctors = async (req, res, next) => {
    try {
        //fetch data
        const doctors = await doctorModel.find({}, "-__v -password -code_expire -code -role");//only fetch name email and role field
        // no details
        if (!doctors) return next(new errorHandling("No doctor record found in the database.", 404));
        //send resposnse
        res.status(200).json({
            status: true,
            doctors
        })


    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }

}
// @method:GET 
// @endpoint:localhost:3000/api/admin/get-doctorById?some=query
// @desc:Controller to get  doctor by name or phone no from database
module.exports.getDoctorByPhoneOrName = async (req, res, next) => {
    try {
        //allow if the user is root or admin
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403));
        //check if there is query presented on URL
        if (Object.keys(req.query).length <= 0) return next(new errorHandling("Empty query: Ensure you're sending the correct information.", 400));
        let searching = {};//create empty object variable
        //if there is name on qurey
        if (req.query.name) searching["name"] = { $regex: req.query.name, $options: "i" };//case inscensitive and finds name similar to given input
        // if there is phone in qurey
        if (req.query.phone) searching["phone"] = req.query.phone;
        // find detail
        const details = await doctorModel.find(searching, "-__v -password -code_expire -code -role");
        // no details
        if (!details || details <= 0) return next(new errorHandling("No doctor record found in the database.", 404));
        // send response
        res.json({
            message: true,
            details
        })

    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}

// @method:POST 
// @endpoint:localhost:3000/api/admin/create-doctor
// @desc:Controller to create doctor 
module.exports.createDoctor = async (req, res, next) => {
    try {
        // allow only if user is root or admin
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403))

        // if body is empty
        if (Object.keys(req.body).length <= 0) return next(new errorHandling(" Empty request body: Ensure you're sending the correct information.", 400))
        //list of fields
        let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword", "photo"];
        let upload = {}
        //filter only fields which are presented on list array
        for (key in req.body) {
            if (list.includes(key)) {
                //store the object
                upload[key] = req.body[key];
            }
        }
        if (req.file) {
            upload["photo"] = req.file.path;
        } else {
            return next(new errorHandling("No photo uploaded. Please upload a photo.", 400));
        }
        //create data on database
        const create = await doctorModel.create(upload);
        //data creation failed
        if (!create) {
            deleteImage(req.file.path);
            return next(new errorHandling("Creation of doctor account was not successful. Please retry.", 500));
        }

        //send success message
        res.status(200).json({
            status: true,
            message: `${create.name} has been successfully created.`

        });
    } catch (error) {

        deleteImage(req.file.path);
        // this erorr code is for duplicate email
        if (error.code === 11000) return next(new errorHandling("This email is already registered. Please use a different one.", 409))
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}
// @method:patch 
// @endpoint:localhost:3000/api/admin/update-doctor/:id
// @desc:Controller to modify doctor presented on database

module.exports.modifyDoctor = async (req, res, next) => {
    try {
        //allow only if user is admin or root

        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403))
        let photoPath = null;
        if (req.file) {
            photoPath = req.file.path; // Store the photo path 
        }
        // if body is empty
        if (Object.keys(req.body).length <= 0 && !photoPath) return next(new errorHandling("Empty request body: Ensure you're sending the correct information.", 400))
        // listing the possible keys of object
        let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword", "photo"];
        let upload = {}
        // if req.body contain email
        if (req.body.email) {
            // validate email
            if (emailValidation(req.body.email)) {
                // check email on databse
                const email = await doctorModel.find({ "email": req.body.email }, "email");
                // if there is email on database

                if (Object.keys(email).length > 0) return next(new errorHandling("This email is already registered. Please use a different one.", 409));

            }
        }
        // if there is password on req.body
        if (req.body.password) {
            // password and confirmPassword doesnot match
            if (req.body.password !== req.body.confirmPassword) {
                return next(new errorHandling("The passwords do not match. Please check and try again.", 400));
            }
        }
        // id from URL
        const id = req.params.id;
        // if no id is given on URL
        if (!id) return next(new errorHandling("Empty id of doctor: Ensure you're sending the correct information.", 400))
        //iterate every key on req.body
        for (key in req.body) {
            // if key matched with the above list array
            if (list.includes(key)) {
                // if key is password
                if (key === "password") {
                    // hash password
                    upload[key] = bcrypt.hashSync(req.body.password, 10);
                    // put confirmPassword to undefined
                    req.body.confirmPassword = undefined;
                } else {
                    upload[key] = req.body[key];
                }

            }
        }
        // Process photo
        if (photoPath) {
            upload["photo"] = photoPath; // Assign new photo path to upload object

            const doctor = await doctorModel.findById(id, "photo"); // Fetch current doctor photo path
            if (doctor && doctor.photo) {
                const rootPath = path.dirname(require.main.filename); // Base directory of the app
                const oldPhotoPath = path.join(rootPath, doctor.photo);

                // Remove old photo
                fs.rm(oldPhotoPath, (err) => {
                    if (err) console.error("Failed to delete old photo:", err);
                });
            }
        }

        // update the details on database
        const update = await doctorModel.findByIdAndUpdate(id, upload,
            {
                new: true, // Return the updated document
                runValidators: true // Run schema validators
            }
        );
        // update fails
        if (!update || Object.keys(update).length <= 0) {

            deleteImage(req.file.path);

            return next(new errorHandling("Modification of doctor account was not successful. Please retry.", 500));
        }
        // send response
        res.status(200).json({
            status: true,
            message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully.`

        });

    } catch (error) {
        deleteImage(req.file.path);

        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

// @method:DELETE
// @endpoint:localhost:3000/api/admin/delete-doctors/:id
// @desc:Controller to delete  doctor presented on database
module.exports.deleteDoctor = async (req, res, next) => {
    try {
        //allow only if user is root or admin
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403))
        // id from url
        let id = req.params.id
        // deleting doctor
        let delDoctor = await doctorModel.findByIdAndDelete(id);

        // if no doctor by this id
        if (!delDoctor || Object.keys(delDoctor).length <= 0) return next(new errorHandling("No doctor record found for the provided ID. Please check and try again.", 404))
        // send response
        res.status(200).json({
            status: true,
            message: `${delDoctor.name} deleted sucessfully.`
        })

    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}


// @method:POST
// @endpoint:localhost:3000/api/doctor/login-doctor
// @desc:Controller to login by doctor
module.exports.doctorLogin = async (req, res, next) => {
    try {
        //extract all keys presented on req.body object
        const keys = Object.keys(req.body)
        // if no keys length is not equal to 2 or key is not email or  password then send error
        if (keys.length !== 2 || !keys.includes('email') || !keys.includes('password')) return next(new errorHandling("Request body must only contain 'email' and 'password'", 400));
        // destructuring email and password from req.body
        const { email, password } = req.body;
        // validate email
        if (!emailValidation(email)) return next(new errorHandling("The email address entered is invalid. Kindly correct it.", 400));
        // check email on database
        const doctor = await doctorModel.findOne({ email }, "name password role");
        // if no detais found by the email
        if (!doctor || Object.keys(doctor).length <= 0) return next(new errorHandling("We couldn't find an doctor record matching this email. Please verify and try again.", 404));
        // store the password from database 

        const dbPassword = doctor.password
        // compare the user password and database password
        const isvalid = await bcrypt.compare(password, dbPassword)
        // if password is not valid
        if (!isvalid) return next(new errorHandling("The password you entered is incorrect. Please try again.", 400));
        // create payload for jwt
        const payload = {
            adminId: doctor._id,
            role: doctor.role,
        };
        // create jwt token
        const token = jwt.sign(payload, process.env.jwtSecretKey, { expiresIn: '1h' });
        // send jwt cooke 
        res.cookie("auth_token", token, {
            httpOnly: true, // Makes the cookie accessible only by the server (prevents JavaScript access)
            secure: process.env.NODE_ENV === "production", // Ensures cookies are only sent over HTTPS in production
            expires: new Date(Date.now() + 3600000), // Cookie expires in 1 hour
            sameSite: "Strict" // Restricts the cookie to same-site requests (prevents CSRF attacks)
        });

        // send response
        return res.status(200).json({
            status: true,
            message: `Hello, ${doctor.name}! Welcome back!`
        });

    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}


// @method:PATCH 
// @endpoint:localhost:3000/api/doctor/update-doctor
// @desc:Controller to  update the password by the doctor

module.exports.updateDoctor = async (req, res, next) => {
    try {
        // allow if the user is doctor
        if (req.admin.role != "doctor") return next(new errorHandling("This task is restricted for authorized users only.", 403));
        // if the req.body is empty
        if (Object.keys(req.body).length <= 0) return next(new errorHandling("Empty request body: Ensure you're sending the correct information.", 400));
        // id from jwtCheck middleware (./admiAuthController)
        const id = req.admin.adminId;
        // if no password and confirmPassword on req.body
        if (!req.body.password || !req.body.confirmPassword) return next(new errorHandling("Password or confirmPassword is empty", 400));
        // check the password and confirmPassword
        if (req.body.password !== req.body.confirmPassword) return next(new errorHandling("Password and confirm password doesnot match.", 400));
        // check the length of password
        if (req.body.password.length < 8) return next(new errorHandling("Password length must be atleast 8 character."), 400);
        const modify = {};
        // hash password
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        // store hashed password
        modify["password"] = hashPassword;
        // change the value of confirmPassword to undefined
        modify["confirmPassword"] = undefined;
        // update the password of the doctor

        const update = await doctorModel.findByIdAndUpdate(id, modify, {
            new: true, // Return the updated document
            runValidators: true, // Run schema validators
            projection: { name: 1 }
        });

        // if error occurs when updating data ie(no doctor found by the id) then send error
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("No doctor record found for the provided ID. Please check and try again.", 500));
        // send sucess response
        res.status(200).json({
            status: true,
            message: `Password updated sucessfully`
        });
    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}


//@endpoint:localhost:3000/api/doctor/forget-password
//@method:PATCH
//@desc:Controler to send password reset link to email
module.exports.forgetPassword = async (req, res, next) => {
    try {
        //destructure email from req.body
        const { email } = req.body;
        // email not found
        if (!email) return next(new errorHandling("Empty email body: Ensure you're sending the correct information.", 400));
        // validate email
        if (!emailValidation(email)) return next(new errorHandling("The email address entered is invalid. Kindly correct it.", 400));
        // check detail in db
        const checkDoctor = await doctorModel.findOne({ email }, "name")
        // no detail found
        if (!checkDoctor || Object.keys(checkDoctor).length <= 0) return next(new errorHandling("We couldn't find an doctor record matching this email. Please verify and try again.", 404));
        const code = crypto.randomBytes(16).toString("hex"); // Generate a random code
        const expire = Date.now() + 10 * 60 * 1000; // Current time + 10 minutes in milliseconds
        // update document
        const update = await doctorModel.findByIdAndUpdate(checkDoctor._id, {
            "code": code,
            "code_expire": expire
        })
        // if update fails
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("Password reset link was not able to send to email. Please retry. ", 500));
        // message part
        const siteUrl = process.env.forgotUrlDoctor
        const message = forgotMessage(code, siteUrl)
        const subject = "Forget password reset token"
        await sendMail(next, message, subject, update.email, update.name);
        // send response
        res.json({
            status: true,
            message: "Password reset link is sent to your email account.The link will expire after 10 minutes "
        })
    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}


//@endpoint:localhost:3000/api/doctor/reset-password/:code
//@method:PATCH
//@desc:Controler to reset password 

module.exports.resetPassword = async (req, res, next) => {
    try {
        //code from url
        const { code } = req.params;
        // check if code is provided on url
        if (!code || Object.keys(req.params).length <= 0) return next(new errorHandling("Empty token params: Ensure you're sending the correct information.", 400));
        // destructuring password and confirmPassword from req.body object
        let { password, confirmPassword } = req.body;
        // if no password or confirm password the send error
        if (!password || !confirmPassword) return next(new errorHandling("Empty password or confirm password body: Ensure you're sending the correct information.", 400));
        // if confirm password and password doesnot match
        if (confirmPassword !== password) return next(new errorHandling("The passwords do not match. Please check and try again.", 400));
        // check if code in database
        const dbCode = await doctorModel.findOne({ code }, "code_expire");
        // code not found
        if (!dbCode || Object.keys(dbCode).length <= 0) return next(new errorHandling("Reset token is invalid or expired. Please try again.", 400));
        // if the expire code is less than current date
        if (dbCode.code_expire < Date.now()) {
            dbCode.code_expire = undefined;
            dbCode.code = undefined
            await dbCode.save()
            return next(new errorHandling("Reset token is invalid or expired.Please try again.", 400));
        }
        // hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        // update document
        const update = await doctorModel.findByIdAndUpdate(dbCode._id, {
            password: hashedPassword,
            confirmPassword: undefined
        }, { new: true });
        // update fail
        if (!update) return next(new errorHandling("Updating the password was not successful. Please retry.", 500));
        // set code and code_expire to undefined
        dbCode.code_expire = undefined;
        dbCode.code = undefined
        await dbCode.save()
        // send response
        res.status(200).json({
            status: true,
            message: "Password Updated Sucessfully"
        })


    } catch (error) { return next(new errorHandling(error.message, error.statusCode || 500)); }
}