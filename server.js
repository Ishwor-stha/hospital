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
const uncaughtError=require("./utils/uncaughtError")

const app = express();
dotenv.config();

// Middleware for parsing cookies and JSON
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));



// Database connection
dbConnection();


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


// Start server
const server=app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  console.log(`App is running in ${process.env.NODE_ENV} mode`);
});

uncaughtError(server)
