class errorHandling extends Error{
    constructor(message,statusCode){
        // overriding err.message of the parent class to custom err message
        super(message)
        // status code willl be provided by while calling class
        this.statusCode=statusCode||500
        // if status code is greater than or equals to 500 then the status will be error otherwise fail
        this.status=false //statusCode>=500?"error":"fail"

    }
}

module.exports=errorHandling