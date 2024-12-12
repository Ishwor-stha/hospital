const multer=require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Save the file with a unique name
    }
});
// File filter for image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        return cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
};
// Configure multer middleware
module.exports.upload = multer({
    storage: storage,
    limits: { fileSize: 1* 1024 * 1024 }, // Limit file size to 1MB
    fileFilter: fileFilter
});

