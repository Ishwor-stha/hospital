const doctorModel = require("../models/doctorModel")
const errorHandling = require("../utils/errorHandling")
const bcrypt = require("bcryptjs")
module.exports.createDoctor = async (req, res, next) => {
    try {
        if ((req.admin.role !== "root" || req.admin.role !== "admin")) return next(new errorHandling("You donot have enough permission to perform this task", 404));
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

    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}


module.exports.modifyDoctor = async (req, res, next) => {
    try {

        if ((req.admin.role !== "root" || req.admin.role !== "admin")) return next(new errorHandling("You donot have enough permission to perform this task", 404));
        if (Object.keys(req.body).length <= 0) return next(new errorHandling("The body is empty", 404))
        let list = ["name", "department", "specialization", "experience", "phone", "email", "availability", "password", "confirmPassword"];
        let upload = {}
        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                return next(new errorHandling("Passwords do not match with confirm password", 400));
            }
        }
        const id = req.params.id

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


    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));


    }



}

module.exports.deleteDoctor=(req,res,next)=>{
//admin root
}


//login


//modify(password,email,name)