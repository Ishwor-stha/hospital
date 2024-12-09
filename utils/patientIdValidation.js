module.exports = (PatientId) => {
        const id = PatientId.split('')[0];//ie P ["P","1","2","3"]
        if (id.includes("P") && PatientId.length >= 14) return true;

        return false;


}