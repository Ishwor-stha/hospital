const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validateEmail = require("../utils/emailValidation");
const errorHandling = require("../utils/errorHandling");


const adminSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: [5, "The length of name must be at least 5 letters"],
        trim: true
    },
    role: {
        type: String,
        default: "admin",
        enum: ["admin", "root"],
    },
    email: {
        type: String,
        required: [true, "Email Field is Missing"],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (email) {
                return validateEmail(email); // Custom email validation function
            },
            message: "Not a valid email", // Error message if validation fails
        },
        unique: true, // Ensures uniqueness 
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
    code: {
        type: String
    },
    code_expire: {
        type: String
    }
});

// Pre-save hook for checking duplicate email and hashing password
adminSchema.pre("save", async function (next) {
    try {
        // Check if the email already exists in the database
        const existingAdmin = await mongoose.model("admin").findOne({ email: this.email });

        if (existingAdmin) {

            return next(new errorHandling("Email already exists", 400)); // Reject save if email exists
        }

        // If the password is modified, hash it before saving
        if (this.isModified("password")) {
            this.password = bcrypt.hashSync(this.password, 10);
            this.confirmPassword = undefined; // Remove confirmPassword after hashing
        }

        next();
    } catch (error) {
        return next(new errorHandling(error.message, error.statusCode || 500));
    }
});


const adminModel = mongoose.model("admin", adminSchema);

module.exports = adminModel;
