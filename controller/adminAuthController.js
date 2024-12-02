const adminModel = require("../models/adminModel");
const errorHandling = require("../utils/errorHandling")
const bcrypt = require("bcryptjs")
const validateEmail = require("../utils/emailValidation")
const jwt = require("jsonwebtoken")




//@desc:check whether a user is login or not 
module.exports.checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        // no token
        if (!token) {
            return next(new errorHandling("Please login first", 403))

        }
        // check token
        jwt.verify(token, process.env.jwtSecretKey, (err, decode) => {
            if (err) {
                return next(new errorHandling("Your Session Expired or invalid token login again", 403))
            }
            req.admin = decode

            next()
        })
    } catch (error) {
        return next(new errorHandling(error.message, 500))
    }
};


//@endpoint:localhost:3000/api/admin/get-admin
//@method:GET
//@desc:Get admin details 
module.exports.getAdmin = async (req, res, next) => {
    try {
        const admins = await adminModel.find({})
        if(!admins ||Object.keys(admins).length<=0) return next(new errorHandling("There is no admin in database"))
        res.status(200).json({
            status:true,
            admins
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))
    }
}

//@endpoint:localhost:3000/api/admin/create-admin
//@method:POST
//@desc:CREATE ADMIN BY ROOT USER
module.exports.createAdmin = async (req, res, next) => {
    try {
        if (req.admin.role != "root") return next(new errorHandling("You donot have enough permission", 404))
        if (Object.keys(req.body).length <= 0) return next(new errorHandling("No data is given", 404))
        let details = ["name", "email", "password", "confirmPassword"];
        let createAdm = {}
        for (key in req.body) {
            if (details.includes(key)) {
                createAdm[key] = req.body[key]
            }
        }
        const upload = await adminModel.create(createAdm)
        if (!upload) return next(new errorHandling("cannot create Admin", 400));
        res.status(200).json({
            status: true,
            message: `${upload.name} admin created sucessfully`
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))
    }

}


//@endpoint:localhost:3000/api/admin/login-admin
//@method:post
//@desc:admin login 
module.exports.adminLogin = async (req, res, next) => {
    try {
        const keys = Object.keys(req.body)
        if (keys.length !== 2 || !keys.includes('email') || !keys.includes('password')) {
            return next(new errorHandling("Request body must only contain 'email' and 'password'", 400))
        }
        const { email, password } = req.body
        if (!validateEmail(email)) return next(new errorHandling("Please enter valid email address", 400))

        const admin = await adminModel.findOne({ email })


        if (!admin || admin.length <= 0) return next(new errorHandling("No admin found by this email", 404))

        const dbPassword = admin.password
        const isvalid = await bcrypt.compare(password, dbPassword)

        if (!isvalid) return next(new errorHandling("Password is incorrect", 400))
        const payload = {
            adminId: admin._id,
            role: admin.role,
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
            message: `Hello ${admin.name}`
        })

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500))
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
        return next(new errorHandling(error.message, error.statusCode || 500))
    }
};



//@endpoint:localhost:3000/api/admin/delete-admin
//@method:delete
//@desc:delete admin  
module.exports.deleteAdmin = async (req, res, next) => {
    try {
        if (req.admin.role !== "root") return next(new errorHandling("You dont have enough permission to delete admin", 404));
        if (!req.params.id || Object.keys(req.params) <= 0) return next(new errorHandling("No id is given", 404));
        let { id } = req.params;
        const del = await adminModel.findByIdAndDelete(id);
        if (!del || Object.keys(del) <= 0) return next(new errorHandling("No data in database"), 404)
        res.status(200).json({
            status: true,
            message: `${del.name} deleted sucessfully`
        })
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));

    }
}

//@endpoint:localhost:3000/api/admin/update-admin
//@method:patch
//@desc:update admin details 
module.exports.updateAdmin = async (req, res, next) => {
    try {

        if (!req.body || Object.keys(req.body).length === 0) {
            return next(new errorHandling("Empty fields", 400));
        }
        const id = req.admin.adminId; // `id` is passed from checkjwt middleware
        if (!id) {
            return next(new errorHandling("ID not provided", 400));
        }

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
                    upload["password"] = hashedPassword
                    req.body.confirmPassword = undefined

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

        res.status(200).json({
            status: true,
            message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully`

        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

//@endpoint:localhost:3000/api/admin/update-admin-root
//@method:patch
//@desc:update admin by root user 

module.exports.updateAdminByRoot = async (req, res, next) => {
    try {
        if (req.admin.role !== "root") return next(new errorHandling("You are not authorized ", 403));
        const id = req.params.id
        
        const check = await adminModel.findById(id)
        if (!check || Object.keys(check).length <= 0) return next(new errorHandling("No admin found for this admin"), 404)

        const inputFields = ["name", "password", "confirmPassword", "email"];
        const upload = {};
        if(!req.body ||Object.keys(req.body).length<=0) return next(new errorHandling("Empty field to update",404))
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
                    upload["password"] = hashedPassword
                    req.body.confirmPassword = undefined

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

        res.status(200).json({
            status:true,
            message: `${Object.keys(upload).filter(key => key !== "confirmPassword").join(", ")} updated successfully`
            
        })


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}