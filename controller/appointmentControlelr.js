const appointmentModel = require("../models/appointmentModel");
const errorHandling = require("../utils/errorHandling");
const doctorModel = require("../models/doctorModel");



//@endpoint:localhost:3000/api/appointment/create-appointment
//@method:POST
//@desc:controller to create appointment by the patients 
module.exports.createAppointment = async (req, res, next) => {
    try {
        // if body is empty then send error
        if (Object.keys(req.body).length === 0) return next(new errorHandling("Empty body", 400));
        // if no doctorId is given in query
        if (!req.query.doctorId) return next(new errorHandling("No doctor ID is given in query", 400));
        // list only allowed fields
        const allowedFields = ["patient_name", "patient_email", "patient_phone", "appointment_date", "reason"];
        const update = {};
        // iterating every key in req.body
        for (const key in req.body) {
            // if key is presented on allowed field
            if (allowedFields.includes(key)) {
                update[key] = req.body[key];
            }
        }
        // insert doctor id on update object
        update["doctor_id"] = req.query.doctorId;

        // Check for duplicate appointments
        const existingAppointment = await appointmentModel.findOne({
            doctor_id: req.query.doctorId,
            patient_email: update.patient_email,
            appointment_date: update.appointment_date,
        });
        // if there is duplicate appointments then send error
        if (existingAppointment) {
            return next(new errorHandling("Appointment already exists for the given date", 409));
        }
        // create appointment on database
        const create = await appointmentModel.create(update);
        // if creation fails then send error
        if (!create) return next(new errorHandling("Cannot create an appointment", 400));
        // send suucess response
        res.status(200).json({
            status: true,
            message: "Appointment created successfully wait for the response from doctor in email",
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

//@endpoint:localhost:3000/api/doctor/approve-appointment
//@method:PATCH
//@desc:controller to approve appointment by the doctor 
module.exports.approveAppointment = async (req, res, next) => {
    try {
        // if the role is not doctor then throw error
        if (!req.admin || req.admin.role !== "doctor") {
            return next(new errorHandling("You do not have permission to approve appointments", 403));
        }

        // if appointmentId is not passed on query then send error
        if (!req.query.appointmentId) {
            return next(new errorHandling("Appointment ID is missing", 400));
        }
        // destructuring date and time from req.body
        const { date, time } = req.body;
        // if no time and date is presented on req.body then send error
        if (!time || !date) {
            return next(new errorHandling("Time or date is missing", 400));
        }
        // checking  the appointment is exists on database
        const appointment = await appointmentModel.findById(req.query.appointmentId);
        // if no appointment is on the database then throw error
        if (!appointment) {
            return next(new errorHandling("Appointment not found", 404));
        }
        // check if doctor is present on database from id
        const doctor = await doctorModel.findById(req.admin.adminId, "name");
        // if no doctor is on the database then throw error
        if (!doctor) {
            return next(new errorHandling("Doctor not found", 404));
        }
        // update the appointment status 
        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            req.query.appointmentId,
            {
                appointment_status: {
                    status: "approved",
                    time,
                    date,
                },
            },
            { new: true }
        );

        // Notify the patient 
        const message = `Your appointment with Dr.${doctor.name} has been approved. Time: ${time}, Date: ${date}`;
        //email

        // send sucess  response
        res.status(200).json({
            status: true,
            message: "Appointment approved successfully",

        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};


//@endpoint:localhost:3000/api/doctor/reject-appointment
//@method:PATCH
//@desc:controller to reject appointment by the doctor 
module.exports.rejectAppointment = async (req, res, next) => {
    try {
        // Check if the user is a doctor
        if (!req.admin || req.admin.role !== "doctor") {
            return next(new errorHandling("You do not have permission to reject appointments", 403));
        }

        // if no appointmentId is given on the query then send error
        if (!req.query.appointmentId) {
            return next(new errorHandling("Appointment ID is missing", 400));
        }

        // destructuring the reason key from req.body
        const { reason } = req.body;
        // if no reason is given on req.body then send error
        if (!reason) {
            return next(new errorHandling("Rejection reason is required", 400));
        }

        // Find the appointment
        const appointment = await appointmentModel.findById(req.query.appointmentId);
        // if no appointment is on the database then send error
        if (!appointment) {
            return next(new errorHandling("Appointment not found", 404));
        }

        // Update the appointment status to "rejected"
        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            req.query.appointmentId,
            {
                appointment_status: {
                    status: "rejected",
                },
                reason_for_rejection: reason,
            },
            { new: true }
        );
        // if update appointment fails
        if (!updatedAppointment) {
            return next(new errorHandling("Failed to reject the appointment", 400));
        }


        const message = `Your appointment with Dr.${req.admin.name} has been rejected. Reason: ${reason}`;
        //email


        // send sucess response
        res.status(200).json({
            status: true,
            message: "Appointment rejected successfully",
            appointment: updatedAppointment,
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

