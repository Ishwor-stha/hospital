const express = require("express");
const dotenv = require("dotenv");
const doctorRoute = require("./routes/doctorRoute");
const dbConnection = require("./utils/mongodb");
const errorController = require("./controller/errorController");
const patientRouter = require("./routes/patientRoute");
const logoutRoute = require("./routes/logOutRoute");
const adminRoute = require("./routes/adminRoutes");
const errorHandling = require("./utils/errorHandling");
const cookieParser = require("cookie-parser");
const uncaughtError = require("./utils/uncaughtError");

// Security packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const xss = require("xss"); // Importing the xss package for sanitization

// CORS configuration
const corsOptions = {
  origin: [process.env.domain], // Allow only specific origins
};

// Rate limiting setup
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window (15 minutes).
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Initialize the Express app
const app = express();
dotenv.config();

// Use middlewares
app.use(limiter);  // Rate-limiting middleware
app.use(helmet());  // Helmet for setting various HTTP headers
app.use(cors(corsOptions));  // CORS configuration
app.use(cookieParser());  // Parse cookies
app.use(express.json({ limit: "10kb" }));  // Parse JSON requests with size limit

// Database connection
dbConnection();

// Middleware for sanitizing user input to prevent XSS attacks
app.use((req, res, next) => {
  // If the request has a body, sanitize its properties
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);  // Sanitize the input
      }
    }
  }
  // If there are query parameters, sanitize them
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);  // Sanitize the query parameter
      }
    }
  }
  next();  // Proceed to the next middleware or route handler
});

// Define routes
app.use("/api", logoutRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/patient", patientRouter);
app.use("/api/admin", adminRoute);

// Handle invalid routes
app.all("*", (req, res, next) => {
  next(new errorHandling("URL path not found", 404));
});

// Error handling middleware
app.use(errorController);

// Start the server
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`App is running in ${process.env.NODE_ENV} mode`);
});

// Handle uncaught errors
uncaughtError(server);
