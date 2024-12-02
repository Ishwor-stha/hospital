const doctorModel = require("../models/doctorModel");
const emailValidation = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

// @method:GET 
// @endpoint:localhost:3000/api/admin/get-doctors
// @desc:Controller to get all doctor presented on database
module.exports.getDoctors = async (req, res, next) => {
    try {
        //allow only if the user is root or admin
        if (req.admin.role === "root" || req.admin.role === "admin") {
            //fetch data
            const doctors = await doctorModel.find({});
            // no details
            if (!doctors) return next(new errorHandling("No doctor in database"), 404);
            //send resposnse
            res.status(200).json({
                status: true,
                doctors
            })
        } else {
            //user is not root or admin
            return next(new errorHandling("You donot have enough permission", 404));

        }


    } catch (error) {

        return next(new errorHandling(error.message, error.statusCode || 500));
    }


}
// @method:GET 
// @endpoint:localhost:3000/api/admin/get-doctorById?some=query
// @desc:Controller to get  doctor by name or phone no from database
module.exports.getDoctorByPhoneOrName = async (req, res, next) => {
    try {
        //allow if the user is root or admin
        if (req.admin.role == "admin" || req.admin.role === "root") {
            //check if there is query presented on URL
            if (Object.keys(req.query).length <= 0) return next(new errorHandling("No query is given", 404));
            let searching = {};//create empty object variable
//if there is name on qurey
            if (req.query.name) searching["name"] = { $regex: req.query.name, $options: "i" };//case inscensitive and finds name similar to given input
            // if there is phone in qurey
            if (req.query.phone) searching["phone"] = req.query.phone;
            // find detail
            const details = await doctorModel.find(searching);
            // no details
            if (!details || details <= 0) return next(new errorHandling("No Doctor found", 404));
            // send response
            res.json({
                message: true,
                details
            })

        }
        else {
            // if user is not an admin or root
            return next(new errorHandling("You donot have enough permission", 404));
        }


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

// @method:POST 
// @endpoint:localhost:3000/api/admin/create-doctor
// @desc:Controller to create doctor 
module.exports.createDoctor = async (req, res, next) => {
    try {
        // allow only if user is root or admin
        if ((req.admin.role === "root" || req.admin.role === "admin")) {
            // if body is empty
            if (Object.keys(req.body).length <= 0) return next(new errorHandling("The body is empty", 404))
            //list of fields
                let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword"];
            let upload = {}
            //filter only fields which are presented on list array
            for (key in req.body) {
                if (list.includes(key)) {
                    //store the object
                    upload[key] = req.body[key];
                }
            }
//create data on database
            const create = await doctorModel.create(upload);
            //data creation failed
            if (!create) return next(new errorHandling("Cannot create doctor please try again", 400));
            //send success message
            res.status(200).json({
                status: true,
                message: `${create.name} created sucessfully`

            });
        } else {
// if user is not root or admin
            return next(new errorHandling("You donot have enough permission to perform this task", 404));
        }




    } catch (error) {
// this erorr code is for duplicate email
        if (error.code === 11000) return next(new errorHandling("Email already exists", 404))
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}
// @method:patch 
// @endpoint:localhost:3000/api/admin/update-doctor/:id
// @desc:Controller to modify doctor presented on database

module.exports.modifyDoctor = async (req, res, next) => {
    try {
//allow only if user is admin or root
        if ((req.admin.role === "root" || req.admin.role === "admin")) {
            // if body is empty
            if (Object.keys(req.body).length <= 0) return next(new errorHandling("The body is empty", 404))
            // listing the possible keys of object
                let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword"];
            let upload = {}
            // if req.body contain email
            if (req.body.email) {
                // validate email
                if (emailValidation(req.body.email)) {
                    // check email on databse
                    const email = await doctorModel.find({ "email": req.body.email });
                    // if there is email on database

                    if (Object.keys(email).length > 0) return next(new errorHandling("Email already exists", 400))

                }
            }
            // if there is password on req.body
            if (req.body.password) {
                // password and confirmPassword doesnot match
                if (req.body.password !== req.body.confirmPassword) {
                    return next(new errorHandling("Passwords do not match with confirm password", 400));
                }
            }
            // id from URL
            const id = req.params.id
            // if no id is given on URL
            if (!id) return next(new errorHandling("Please provide id of a doctor", 400))
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
            // update the details on database
            const update = await doctorModel.findByIdAndUpdate(id, upload,
                {
                    new: true, // Return the updated document
                    runValidators: true // Run schema validators
                }
            );
            // update fails
            if (!update || Object.keys(update).length <= 0) return next(new errorHandling("Cannot update details", 404))
            // send response
                res.status(200).json({
                status: true,
                message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully`

            })
        } else {
            return next(new errorHandling("You donot have enough permission to perform this task", 404));

        }



    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));


    }



}

// @method:DELETE
// @endpoint:localhost:3000/api/admin/delete-doctors/:id
// @desc:Controller to delete  doctor presented on database
module.exports.deleteDoctor = async (req, res, next) => {
    try {
        //allow only if user is root or admin
        if (req.admin.role === "root" || req.admin.role === "admin") {
            // id from url
            let id = req.params.id
            // deleting doctor
            let delDoctor = await doctorModel.findByIdAndDelete(id);
            // if no doctor by this id
            if (!delDoctor || Object.keys(delDoctor).length <= 0) return next(new errorHandling("No doctor found by this id", 404))
            // send response
                res.status(200).json({
                status: true,
                message: `${delDoctor.name} deleted sucessfully`
            })

        } else {
            return next(new errorHandling("You donot have enough permission to perform this task", 404));

        }
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


// @method:POST
// @endpoint:localhost:3000/api/doctor/login-doctor
// @desc:Controller to login by doctor
module.exports.doctorLogin = async (req, res, next) => {
    try {
        //extract all keys presented on req.body object
        const keys = Object.keys(req.body)
        // if no keys length is not equal to 2 or key is not email or  password then send error
        if (keys.length !== 2 || !keys.includes('email') || !keys.includes('password')) {
            return next(new errorHandling("Request body must only contain 'email' and 'password'", 400))
        }
// destructuring email and password from req.body
        const { email, password } = req.body
        // validate email
        if (!emailValidation(email)) return next(new errorHandling("Please enter valid email address", 400))
// check email on database
        const doctor = await doctorModel.findOne({ email })
// if no detais found by the email

        if (!doctor || Object.keys(doctor).length <= 0) return next(new errorHandling("No doctor found by this email", 404))
            // store the password from database 

        const dbPassword = doctor.password
        // compare the user password and database password
        const isvalid = await bcrypt.compare(password, dbPassword)
// if password is not valid
        if (!isvalid) return next(new errorHandling("Password is incorrect", 400))
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
            message: `Hello ${doctor.name}`
        })

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


// @method:PATCH 
// @endpoint:localhost:3000/api/doctor/update-doctor
// @desc:Controller to  update the password by the doctor

module.exports.updateDoctor = async (req, res, next) => {
    try {
        // allow if the user is doctor
        if (req.admin.role != "doctor") return next(new errorHandling("Only a doctor can perform this task", 404));
        // if the req.body is empty
        if(Object.keys(req.body).length<=0)return next(new errorHandling("Empty body",404));
        // id from jwtCheck middleware (./admiAuthController)
        const id = req.admin.adminId;
        // if no password and confirmPassword on req.body
        if (!req.body.password || !req.body.confirmPassword) return next(new errorHandling("Password or confirmPassword is empty", 400));
        // check the password and confirmPassword
        if(req.body.password!==req.body.confirmPassword)return next(new errorHandling("Passoword and confirm password doesnot match",400));
        // check the length of password
        if(req.body.password.length<8) return next(new errorHandling("Password length must be atleast 8 character"),400);

        const modify = {};
        // hash password
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        // store hashed password
        modify["password"] = hashPassword;
        // change the value of confirmPassword to undefined
        modify["confirmPassword"]=undefined;
// update the password of the doctor

        const update = await doctorModel.findByIdAndUpdate(id, modify,{
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        });
        // if error occurs when updating data ie(no doctor found by the id) then send error
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("No doctor found by this id", 404));
        // send sucess response
        res.status(200).json({
            status: true,
            message: `Password updated sucessfully`
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}