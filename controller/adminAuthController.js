const adminModel = require("../models/adminModel");
const errorHandling = require("../utils/errorHandling");
const bcrypt = require("bcryptjs");
const validateEmail = require("../utils/emailValidation");
const jwt = require("jsonwebtoken");
const emailValidation = require("../utils/emailValidation");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail")
const { forgotMessage } = require("../utils/forgetMessage")

//@desc:check whether a user is login or not 
module.exports.checkJwt = (req, res, next) => {
    try {
        // token form client browser
        const token = req.cookies.auth_token;
        // no token
        if (!token) {
            return next(new errorHandling("Please login first", 403));

        }
        // check token
        jwt.verify(token, process.env.jwtSecretKey, (err, decode) => {
            if (err) {
                return next(new errorHandling("Your Session Expired or invalid token login again", 403));
            }
            req.admin = decode

            next()
        })
    } catch (error) {
        return next(new errorHandling(error.message, 500));
    }
};


//@endpoint:localhost:3000/api/admin/get-admin
//@method:GET
//@desc:Get admin details 
module.exports.getAdmin = async (req, res, next) => {
    try {
        if (req.admin.role != "root") return next(new errorHandling("You are not authorized to perform this task", 403));
        // fetch all detalil from database;
        const admins = await adminModel.find({}, "name role email -_id");
        // no details on databse;
        if (!admins || Object.keys(admins).length <= 0) return next(new errorHandling("There is no admin in database", 404));
        // send sucess response
        res.status(200).json({
            status: true,
            admins
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

//@endpoint:localhost:3000/api/admin/create-admin
//@method:POST
//@desc:CREATE ADMIN BY ROOT USER
module.exports.createAdmin = async (req, res, next) => {
    try {
        // allow only if the user is root
        if (req.admin.role != "root") return next(new errorHandling("You donot have enough permission", 403));
        // req.body is empty
        if (Object.keys(req.body).length <= 0) return next(new errorHandling("No data is given", 404));
        // list of possible fields
        let details = ["name", "email", "password", "confirmPassword"];
        let createAdm = {};
        // iterate all keys on req.body 
        for (key in req.body) {
            // if key is presented on the array
            if (details.includes(key)) {
                // store the value to the object
                createAdm[key] = req.body[key];
            }
        }
        // update the data on database
        const upload = await adminModel.create(createAdm);
        // data update fails send error 
        if (!upload) return next(new errorHandling("cannot create Admin", 400));
        // send sucess message
        res.status(201).json({
            status: true,
            message: `${upload.name} admin created sucessfully`
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }

}


//@endpoint:localhost:3000/api/admin/login-admin
//@method:post
//@desc:admin login 
module.exports.adminLogin = async (req, res, next) => {
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
        if (!validateEmail(email)) return next(new errorHandling("Please enter valid email address", 400));
        // search email on database
        const admin = await adminModel.findOne({ email }, "name email password role");//fetch only name,email and password ,role

        // if no email found then send error
        if (!admin || Object.keys(admin).length <= 0) return next(new errorHandling("No admin found by this email", 404));
        //  store the password of database
        const dbPassword = admin.password;
        // compare database password with user password
        const isvalid = await bcrypt.compare(password, dbPassword);
        // if password is not valid then throw error
        if (!isvalid) return next(new errorHandling("Password is incorrect", 403));
        // create payload for jwt 
        const payload = {
            adminId: admin._id,
            role: admin.role,
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
            message: `Hello ${admin.name}`
        });

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

//@endpoint:localhost:3000/api/admin/logout-admin
//@method:delete
//@desc:logout admin  
module.exports.logoutAdmin = (req, res, next) => {
    try {
        // Clear the cookie by setting it to a past date
        res.clearCookie("auth_token", {
            httpOnly: true, // Ensures that the cookie is not accessible via JavaScript
            // secure: process.env.NODE_ENV === "production", // Ensure cookie is sent only over HTTPS in production
            sameSite: "strict", // Helps mitigate CSRF attacks
        });

        // Send a response confirming the logout
        res.status(200).json({
            status: true,
            message: "Successfully logged out.",
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};



//@endpoint:localhost:3000/api/admin/delete-admin
//@method:delete
//@desc:delete admin  
module.exports.deleteAdmin = async (req, res, next) => {
    try {
        // if user is not root the throw error
        if (req.admin.role !== "root") return next(new errorHandling("You dont have enough permission to delete admin", 403));
        // if id is not given on url
        if (!req.params.id || Object.keys(req.params) <= 0) return next(new errorHandling("No id is given", 404));
        // id from url
        let { id } = req.params;
        // delete admin
        const del = await adminModel.findByIdAndDelete(id);
        // if delete fail
        if (!del || Object.keys(del) <= 0) return next(new errorHandling("No data in database"), 404);
        // send suucess message
        res.status(200).json({
            status: true,
            message: `${del.name} deleted sucessfully`
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}

//@endpoint:localhost:3000/api/admin/update-admin
//@method:patch
//@desc:update admin details 
module.exports.updateAdmin = async (req, res, next) => {
    try {
        // if no req.body
        if (!req.body || Object.keys(req.body).length === 0) {
            return next(new errorHandling("Empty fields", 400));
        }
        const id = req.admin.adminId; // `id` is passed from checkjwt middleware
        if (!id) {
            return next(new errorHandling("ID not provided", 400));
        }
        // array of possible fields
        const inputFields = ["name", "password", "confirmPassword", "email"];
        const upload = {};
        // Validate password and confirmPassword match (if provided)
        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                return next(new errorHandling("Passwords do not match with confirm password", 400));
            }
        }

        // Filter valid fields from the request body
        for (const key in req.body) {
            if (inputFields.includes(key)) {
                if (key === "password") {
                    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
                    upload["password"] = hashedPassword;
                    req.body.confirmPassword = undefined;

                } else {
                    upload[key] = req.body[key];
                }
            }
        }

        // Update the document
        const update = await adminModel.findByIdAndUpdate(id, upload, {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        });

        if (!update) {
            return next(new errorHandling("Admin not found", 404));
        }

        // send sucess response
        res.status(200).json({
            status: true,
            message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully`

        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

//@endpoint:localhost:3000/api/admin/update-admin-root/:id
//@method:patch
//@desc:update admin by root user 

module.exports.updateAdminByRoot = async (req, res, next) => {
    try {
        // if the user is not a root user 

        if (req.admin.role !== "root") return next(new errorHandling("You are not authorized ", 403));
        // id from url
        const id = req.params.id;
        // if no id on url
        if (!id) return next(new errorHandling("Id is not given"), 400);
        //if email is in the req.body
        if (req.body.email) {
            // validate email
            if (emailValidation(req.body.email)) {
                // check email on database
                const check = await adminModel.find({ "email": req.body.email }, "email");
                // if there is email on data base send error
                if (Object.keys(check).length > 0) return next(new errorHandling("Email already exists", 404));

            } else {
                // if email validation fails
                return next(new errorHandling("Please enter valid email address", 400));
            }
        }

        // possible fields key
        const inputFields = ["name", "password", "confirmPassword", "email"];
        const upload = {};
        // if req.body is empty then send error messaage
        if (!req.body || Object.keys(req.body).length <= 0) return next(new errorHandling("Empty field to update", 404));;
        // Validate password and confirmPassword match (if provided)
        if (req.body.password) {
            // check the confirmPassword and password
            if (req.body.password !== req.body.confirmPassword) {
                return next(new errorHandling("Passwords do not match with confirm password", 400));
            }
        }

        // Filter valid fields from the request body
        for (const key in req.body) {
            if (inputFields.includes(key)) {
                if (key === "password") {
                    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
                    upload["password"] = hashedPassword;
                    req.body.confirmPassword = undefined;

                } else {
                    upload[key] = req.body[key];
                }
            }
        }

        // Update the document
        const update = await adminModel.findByIdAndUpdate(id, upload, {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        });

        // send sucess response
        res.status(200).json({
            status: true,
            message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully`

        });


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}



//@endpoint:localhost:3000/api/admin/forget-password
//@method:PATCH
//@desc:Controler to send password reset link to email
module.exports.forgetPassword = async (req, res, next) => {
    try {
        //destructuring email from req.body object
        const { email } = req.body;
        // no email
        if (!email) return next(new errorHandling("Enter email", 400));
        // validate email
        if (!emailValidation(email)) return next(new errorHandling("Enter valid email address", 400));
        // check email in db
        const checkAdmin = await adminModel.findOne({ email }, "name")
        // no detail found on db
        if (!checkAdmin || Object.keys(checkAdmin).length <= 0) return next(new errorHandling("No user found by this email", 404));
        const code = crypto.randomBytes(16).toString("hex"); // Generate a random code
        const expire = Date.now() + 10 * 60 * 1000; // Current time + 10 minutes in milliseconds
        // update document 
        const update = await adminModel.findByIdAndUpdate(checkAdmin._id, {
            "code": code,
            "code_expire": expire
        })
        // update fails
        if (!update || Object.keys(update).length <= 0) return next(new errorHandling("Error while forgetting password please try again later", 400));
        // message part
        const siteUrl = process.env.forgotUrlAdmin
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

//@endpoint:localhost:3000/api/admin/reset-password/:code
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
        const dbCode = await adminModel.findOne({ code }, "code_expire");
        // code not found
        if (!dbCode || Object.keys(dbCode).length <= 0) return next(new errorHandling("Reset token is invalid or expire please try again", 404));
        // if the expire code is less than current date
        if (dbCode.code_expire < Date.now()) {
            dbCode.code_expire = undefined;
            dbCode.code = undefined
            await dbCode.save()
            return next(new errorHandling("Reset token is invalid or expire please try again", 404));
        }
        // hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        // update document
        const update = await adminModel.findByIdAndUpdate(dbCode._id, {
            password: hashedPassword,
            confirmPassword: undefined
        }, { new: true });
        // update fail
        if (!update) return next(new errorHandling("Cannot update password try again", 400));
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