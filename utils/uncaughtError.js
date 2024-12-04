// utils/errorHandlers.js

module.exports = (server) => {
    // Global uncaught exception handler
    process.on("uncaughtException", (err) => {
        console.error("Uncaught Exception:", err.message);
        console.error(err.stack);
        // Optionally, log the error to a monitoring service like Sentry, etc.

        // Gracefully shutdown the server
        server.close(() => {
            process.exit(1); // Exit after the server has stopped
        });

        // If server shutdown takes too long, force exit after timeout
        setTimeout(() => {
            process.exit(1);
        }, 10000); // 10 seconds timeout
    });

    // Global unhandled promise rejection handler
    process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
        // Optionally, log the error to a monitoring service

        // Gracefully shutdown the server
        server.close(() => {
            process.exit(1); // Exit after the server has stopped
        });

        // If server shutdown takes too long, force exit after timeout
        setTimeout(() => {
            process.exit(1);
        }, 10000); // 10 seconds timeout
    });
};
