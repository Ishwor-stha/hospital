const mongoose = require('mongoose');

module.exports = () => {
    try{

        mongoose.connect(process.env.mongodbConnection)
        console.log("Database Connection Sucessfull")
    }catch(error){
        console.error("Database connection error:", error);
        process.exit(1);  // Exit the application if the DB connection fails
    }
    
    
  
};
