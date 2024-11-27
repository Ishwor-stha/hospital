const validator=require("validator");
module.exports=(email)=>{
    const isValid=validator.isEmail(email);
    const list=["gmail.com","yahoo.com"];
    let lastPart=email.split("@")
    lastPart=lastPart[1]
    if(isValid && list.includes(lastPart)){
        return true
    }
    else{
        return false
    }
}
