const appointmentModel = require("../models/appointmentModel");
const errorHandling = require("../utils/errorHandling");
const doctorModel = require("../models/doctorModel");
const sendEmail = require("../utils/sendMail");
const { approveMessage, rejectMessage } = require("../utils/message")




//@endpoint:localhost:3000/api/appointment/create-appointment
//@method:POST
//@desc:controller to create appointment by the patients 
module.exports.createAppointment = async (req, res, next) => {
    try {
        if (req.admin.role !== "patient") return next(new errorHandling("This task is restricted for authorized users only.", 403));
        // if body is empty then send error
        if (Object.keys(req.body).length === 0) return next(new errorHandling("Empty request body: Ensure you're sending the correct information.", 400));
        // if no doctorId is given in query
        if (!req.query.doctorId) return next(new errorHandling("Empty id query: Ensure you're sending the correct information.", 400));
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
        update["patient_id"] = req.admin.adminId;

        // Check for duplicate appointments
        const existingAppointment = await appointmentModel.findOne({
            doctor_id: req.query.doctorId,
            patient_email: update.patient_email,
            appointment_date: update.appointment_date,
        });
        // if there is duplicate appointments then send error
        if (existingAppointment)return next(new errorHandling("Appointment already exists for the given date", 409));
        // create appointment on database
        const create = await appointmentModel.create(update);
        // if creation fails then send error
        if (!create) return next(new errorHandling("Creation of appointment was not successful. Please retry.", 500));
        // send suucess response
        res.status(200).json({
            status: true,
            message: "Appointment created successfully wait for the response from doctor in email",
        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
}

//@endpoint:localhost:3000/api/doctor/approve-appointment
//@method:PATCH
//@desc:controller to approve appointment by the doctor 
module.exports.approveAppointment = async (req, res, next) => {
    try {
        // if the role is not doctor then throw error
        if (!req.admin || req.admin.role !== "doctor") return next(new errorHandling("This task is restricted for authorized users only.", 403));

        // if appointmentId is not passed on query then send error
        if (!req.query.appointmentId) return next(new errorHandling("Empty appointment id  query: Ensure you're sending the correct information.", 400));
        // destructuring date and time from req.body
        const { date, time } = req.body;
        // if no time and date is presented on req.body then send error
        if (!time || !date) return next(new errorHandling("The time or date is missing. Please provide both to proceed", 400));
        // checking  the appointment is exists on database
        const appointment = await appointmentModel.findById(req.query.appointmentId);
        // if no appointment is on the database then throw error
        if (!appointment) return next(new errorHandling("We couldn't find an appointment record matching this id. Please verify and try again.", 404));
        // check if doctor is present on database from id
        const doctor = await doctorModel.findById(req.admin.adminId, "name");
        // if no doctor is on the database then throw error
        if (!doctor) return next(new errorHandling("We couldn't find an doctor record matching this id. Please verify and try again.", 404));
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
        const message = approveMessage(updatedAppointment.patient_name, doctor.name, date, time);
        const subject = "Appointment Approval Notification";
        const email = updatedAppointment.patient_email;
        const name = updatedAppointment.patient_name;

        // Send email notification
        await sendEmail(next, message, subject, email, name);
        //email

        // send sucess  response
        res.status(200).json({
            status: true,
            message: "Appointment approved successfully and email is send to the patient",

        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
};


//@endpoint:localhost:3000/api/doctor/reject-appointment
//@method:PATCH
//@desc:controller to reject appointment by the doctor 

module.exports.rejectAppointment = async (req, res, next) => {
    try {
        // Check if the user is a doctor
        if (!req.admin || req.admin.role !== "doctor") return next(new errorHandling("This task is restricted for authorized users only.", 403));

        // If no appointmentId is given on the query, send an error
        if (!req.query.appointmentId)return next(new errorHandling("Empty appointment id query: Ensure you're sending the correct information.", 400));

        // Destructure the reason key from req.body
        const { reason } = req.body;

        // If no reason is given in req.body, send an error
        if (!reason) return next(new errorHandling("Rejection reason is required.", 400));
        const checkDoctor = await doctorModel.findById(req.admin.adminId, "name");
        if (!checkDoctor) return next(new errorHandling("No doctor record found for the provided ID. Please login  again.", 404));

        // Find the appointment
        const appointment = await appointmentModel.findById(req.query.appointmentId);

        // If no appointment is found in the database, send an error
        if (!appointment) return next(new errorHandling("No appointment record found for the provided ID. Please check and try again.", 404));

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

        // If updating the appointment fails
        if (!updatedAppointment)return next(new errorHandling("Unable to decline the appointment.", 500));

        // Prepare the email details
        const message = rejectMessage(updatedAppointment.patient_name, checkDoctor.name, reason);
        const subject = "Appointment Approval Notification";
        const email = updatedAppointment.patient_email;
        const name = updatedAppointment.patient_name;

        // Send email notification
        await sendEmail(next, message, subject, email, name);

        // Send success response
        res.status(200).json({
            status: true,
            message: "Appointment rejected successfully and email is send to patient"

        });
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
};


//@endpoint:localhost:3000/api/admin/delete-appointment?appointmentId=***  /view-appointments
//@method:delete
//@desc:controller to delete appointment by the admin
module.exports.deleteAppointment = async (req, res, next) => {
    try {
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 400));
        const { appointmentId } = req.query;
        if (!appointmentId) return next(new errorHandling("Empty appointment id query: Ensure you're sending the correct information.", 400));
        const deleteAppointment = await appointmentModel.findByIdAndDelete(appointmentId);
        if (!deleteAppointment) return next(new errorHandling("Deletiion of appointment  was not successful. Please retry.", 500));
        res.status(200).json({
            status: true,
            message: `${deleteAppointment.patient_name}'s appointment deleted sucessfully.`
        });

    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}

}

//@endpoint:localhost:3000/api/admin/view-appointments
//@method:GET
//@desc:controller to view appointment by the admin
module.exports.viewAppointments = async (req, res, next) => {
    try {
        if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403));
        const viewAppointment = await appointmentModel.find({}, "-id -__v");
        if (!viewAppointment || Object.keys(viewAppointment).length <= 0) return next(new errorHandling("No appointment record found in the database.", 404));
        res.status(200).json({
            status: true,
            appointments: viewAppointment
        });

    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
}
//@endpoint:localhost:3000/api/doctor/view-appointment
//@method:GET
//@desc:controller to view appointment by the docotor
module.exports.viewDoctorAppointment = async (req, res, next) => {
    try {
        if (req.admin.role !== "doctor") return next(new errorHandling("This task is restricted for authorized users only. ", 403));
        const doctorId = req.admin.adminId;
        if (!doctorId) return next(new errorHandling("Empty doctor id : Ensure you're logged in. ", 400));
        const view = await appointmentModel.find({ "doctor_id": doctorId }, "-doctor_id -__v");
        if (!view || Object.keys(view).length <= 0) return next(new errorHandling("No appointment record found in the database.", 404));
        res.status(200).json({
            status: true,
            appointment: view

        })
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
}
//@endpoint:localhost:3000/api/patient/view-appointment
//@method:GET
//@desc:controller to view appointment by the patient
module.exports.viewPatientAppointment = async (req, res, next) => {
    try {
        if (req.admin.role !== "patient") return next(new errorHandling("This task is restricted for authorized users only.", 403));
        const patientId = req.admin.adminId;
        if (!patientId) return next(new errorHandling("Empty patient id : Ensure you're logged in.", 400));
        const view = await appointmentModel.find({ "patient_id": patientId }, "-patient_id -__v");
        if (!view || Object.keys(view).length <= 0) return next(new errorHandling("No appointment record found in the database.", 404));
        res.status(200).json({
            status: true,
            appointment: view

        })
    } catch (error) {return next(new errorHandling(error.message, error.statusCode || 500));}
}





