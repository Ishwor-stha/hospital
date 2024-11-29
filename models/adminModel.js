const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validateEmail = require("../utils/emailValidation");

const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [5, "The length of name must be at least 5 letters"],
    },
    role: {
        type: String,
        default: "admin",
        enum: ["admin", "root"],
    },
    email: {
        type: String,
        required: [true, "Email Field is Missing"],
        validate: {
            validator: function (email) {
                return validateEmail(email); // Custom email validation function
            },
            message: "Not a valid email", // Error message if validation fails
        },
        unique: true, // Ensures uniqueness at the database level
    },
    password: {
        type: String,
        minlength: [8, "Minimum password length must be 8 characters"],
        required: [true, "Password field is missing"],
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm password field is missing"],
        validate: {
            validator: function (confirmPassword) {
                return confirmPassword === this.password;
            },
            message: "Password and Confirm password must be the same",
        },
    },
});

// Pre-save hook for checking duplicate email and hashing password
adminSchema.pre("save", async function (next) {
    // Check if the email already exists in the database
    const existingAdmin = await mongoose.model("admin").findOne({ email: this.email });
    
    if (existingAdmin) {
        const error = new Error("Email already exists");
        return next(error); // Reject save if email exists
    }

    // If the password is modified, hash it before saving
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmPassword = undefined; // Remove confirmPassword after hashing
    }

    next(); // Proceed with saving the document
});

// Create and export the admin model
const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
