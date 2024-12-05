const appointmentModel = require("../models/appointmentModel");
const errorHandling = require("../utils/errorHandling");
const doctorModel = require("../models/doctorModel");

module.exports.createAppointment = async (req, res, next) => {
    try {
        if (Object.keys(req.body).length === 0) return next(new errorHandling("Empty body", 400));
        if (!req.query.doctorId) return next(new errorHandling("No doctor ID is given in query", 400));

        const allowedFields = ["patient_name", "patient_email", "patient_phone", "appointment_date", "reason"];
        const update = {};
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                update[key] = req.body[key];
            }
        }
        update["doctor_id"] = req.query.doctorId;

        // Check for duplicate appointments
        const existingAppointment = await appointmentModel.findOne({
            doctor_id: req.query.doctorId,
            patient_email: update.patient_email,
            appointment_date: update.appointment_date,
        });

        if (existingAppointment) {
            return next(new errorHandling("Appointment already exists for the given date", 409));
        }

        const create = await appointmentModel.create(update);
        if (!create) return next(new errorHandling("Cannot create an appointment", 400));

        res.status(200).json({
            status: true,
            message: "Appointment created successfully wait for the response from doctor in email",
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
}

module.exports.approveAppointment = async (req, res, next) => {
    try {
        if (!req.admin || req.admin.role !== "doctor") {
            return next(new errorHandling("You do not have permission to approve appointments", 403));
        }
        if (!req.query.appointmentId) {
            return next(new errorHandling("Appointment ID is missing", 400));
        }

        const { date, time } = req.body;
        if (!time || !date) {
            return next(new errorHandling("Time or date is missing", 400));
        }

        const appointment = await appointmentModel.findById(req.query.appointmentId);
        if (!appointment) {
            return next(new errorHandling("Appointment not found", 404));
        }

        const doctor = await doctorModel.findById(req.admin.adminId, "name");
        if (!doctor) {
            return next(new errorHandling("Doctor not found", 404));
        }

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

        // Notify the patient (e.g., send email or SMS)
        const message = `Your appointment with Dr.${doctor.name} has been approved. Time: ${time}, Date: ${date}`;
        console.log(message)

        res.status(200).json({
            status: true,
            message: "Appointment approved successfully",

        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

module.exports.rejectAppointment = async (req, res, next) => {
    try {
        // Check if the user is a doctor
        if (!req.admin || req.admin.role !== "doctor") {
            return next(new errorHandling("You do not have permission to reject appointments", 403));
        }

        // Validate query parameters
        if (!req.query.appointmentId) {
            return next(new errorHandling("Appointment ID is missing", 400));
        }

        // Check if rejection reason is provided
        const { reason } = req.body;
        if (!reason) {
            return next(new errorHandling("Rejection reason is required", 400));
        }

        // Find the appointment
        const appointment = await appointmentModel.findById(req.query.appointmentId);
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

        if (!updatedAppointment) {
            return next(new errorHandling("Failed to reject the appointment", 400));
        }


        const message = `Your appointment with Dr. ${req.admin.name} has been rejected. Reason: ${reason}`;


        // Respond to the client
        res.status(200).json({
            status: true,
            message: "Appointment rejected successfully",
            appointment: updatedAppointment,
        });
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
};

