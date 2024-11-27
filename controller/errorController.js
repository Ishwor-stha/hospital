module.exports=(err,req,res,next)=>{
    // all the error details comes from the user through ../utils/error handling
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        detail:err.stack

    })
}