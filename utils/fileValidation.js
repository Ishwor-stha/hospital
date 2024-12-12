const errorHandling = require("./errorHandling");
module.exports.validateFile = (req, res, next) => {
    // allow only if user is root or admin
    if (!["root", "admin"].includes(req.admin.role)) return next(new errorHandling("This task is restricted for authorized users only.", 403));

    // Perform body validation or other checks first
    if (Object.keys(req.body).length <= 0) return next(new errorHandling(" Empty request body: Ensure you're sending the correct information.", 400));

    // Check if the photo file is included
    if (!req.file) {
        return next(new errorHandling("No photo uploaded. Please upload a photo.", 400));
    }

    // If all checks pass, proceed to file upload middleware
    next();
};
