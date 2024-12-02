const doctorModel = require("../models/doctorModel");
const emailValidation = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { updateAdminByRoot } = require("./adminAuthController");

module.exports.getDoctors = async (req, res, next) => {
    try {
        if (req.admin.role === "root" || req.admin.role === "admin") {
            const doctors = await doctorModel.find({});
            if (!doctors) return next(new errorHandling("No doctor in database"), 404);
            res.status(200).json({
                status: true,
                doctors
            })
        } else {
            return next(new errorHandling("You donot have enough permission", 404));

        }


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }


}

module.exports.getDoctorByPhoneOrName = async (req, res, next) => {
    try {
        if (req.admin.role == "admin" || req.admin.role === "root") {
            //no query
            if (Object.keys(req.query).length <= 0) return next(new errorHandling("No query is given", 404));
            let searching = {};

            if (req.query.name) searching["name"] = { $regex: req.query.name, $options: "i" };//case inscensitive and finds name similar to given input
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
            return next(new errorHandling("You donot have enough permission", 404));
        }


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


module.exports.createDoctor = async (req, res, next) => {
    try {
        if ((req.admin.role === "root" || req.admin.role === "admin")) {
            if (Object.keys(req.body).length <= 0) return next(new errorHandling("The body is empty", 404))
            let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword"];
            let upload = {}
            for (key in req.body) {
                if (list.includes(key)) {
                    upload[key] = req.body[key];
                }
            }

            const create = await doctorModel.create(upload);
            if (!create) return next(new errorHandling("Cannot create doctor please try again", 400));
            res.status(200).json({
                status: true,
                message: `${create.name} created sucessfully`

            });
        } else {

            return next(new errorHandling("You donot have enough permission to perform this task", 404));
        }




    } catch (error) {

        if (error.code === 11000) return next(new errorHandling("Email already exists", 404))
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


module.exports.modifyDoctor = async (req, res, next) => {
    try {

        if ((req.admin.role === "root" || req.admin.role === "admin")) {
            if (Object.keys(req.body).length <= 0) return next(new errorHandling("The body is empty", 404))
            let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword"];
            let upload = {}
            if (req.body.email) {
                if (emailValidation(req.body.email)) {
                    const email = await doctorModel.find({ "email": req.body.email });

                    if (Object.keys(email).length > 0) return next(new errorHandling("Email already exists", 400))

                }
            }
            if (req.body.password) {
                if (req.body.password !== req.body.confirmPassword) {
                    return next(new errorHandling("Passwords do not match with confirm password", 400));
                }
            }
            const id = req.params.id
            if (!id) return next(new errorHandling("Please provide id of a doctor", 400))
            for (key in req.body) {
                if (list.includes(key)) {
                    if (key === "password") {
                        upload[key] = bcrypt.hashSync(req.body.password, 10);
                        req.body.confirmPassword = undefined;
                    } else {
                        upload[key] = req.body[key];
                    }

                }
            }
            const update = await doctorModel.findByIdAndUpdate(id, upload,
                {
                    new: true, // Return the updated document
                    runValidators: true // Run schema validators
                }
            );
            if (!update || Object.keys(update).length <= 0) return next(new errorHandling("Cannot update details", 404))
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


module.exports.deleteDoctor = async (req, res, next) => {
    try {
        if (req.admin.role === "root" || req.admin.role === "admin") {
            let id = req.params.id
            let delDoctor = await doctorModel.findByIdAndDelete(id);
            if (!delDoctor || Object.keys(delDoctor).length <= 0) return next(new errorHandling("No doctor found by this id", 404))
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


//login
module.exports.doctorLogin = async (req, res, next) => {
    try {
        const keys = Object.keys(req.body)
        if (keys.length !== 2 || !keys.includes('email') || !keys.includes('password')) {
            return next(new errorHandling("Request body must only contain 'email' and 'password'", 400))
        }
        const { email, password } = req.body
        if (!emailValidation(email)) return next(new errorHandling("Please enter valid email address", 400))

        const doctor = await doctorModel.findOne({ email })


        if (!doctor || Object.keys(doctor).length <= 0) return next(new errorHandling("No doctor found by this email", 404))

        const dbPassword = doctor.password
        const isvalid = await bcrypt.compare(password, dbPassword)

        if (!isvalid) return next(new errorHandling("Password is incorrect", 400))
        const payload = {
            adminId: doctor._id,
            role: doctor.role,
        };

        const token = jwt.sign(payload, process.env.jwtSecretKey, { expiresIn: '1h' });
        res.cookie("auth_token", token, {
            httpOnly: true, // Makes the cookie accessible only by the server (prevents JavaScript access)
            secure: process.env.NODE_ENV === "production", // Ensures cookies are only sent over HTTPS in production
            expires: new Date(Date.now() + 3600000), // Cookie expires in 1 hour
            sameSite: "Strict" // Restricts the cookie to same-site requests (prevents CSRF attacks)
        });

        return res.status(200).json({
            status: true,
            message: `Hello ${doctor.name}`
        })

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


//modify(password)

module.exports.updateDoctor = async (req, res, next) => {
    try {
        
        if (req.admin.role != "doctor") return next(new errorHandling("Only a doctor can perform this task", 404));
        if(Object.keys(req.body).length<=0)return next(new errorHandling("Empty body",404));
        const id = req.admin.adminId;
        if (!req.body.password || !req.body.confirmPassword) return next(new errorHandling("Password or confirmPassword is empty", 400));
        if(req.body.password!==req.body.confirmPassword)return next(new errorHandling("Passoword and confirm password doesnot match",400));
        if(req.body.password.length<8) return next(new errorHandling("Password length must be atleast 8 character"),400);

        const modify = {};
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
        modify["password"] = hashPassword;
        modify["confirmPassword"]=undefined;


        const update = await doctorModel.findByIdAndUpdate(id, modify,{
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        });
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("No doctor found by this id", 404));
        res.status(200).json({
            status: true,
            message: `Password updated sucessfully`
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}