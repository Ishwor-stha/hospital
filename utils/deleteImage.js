const fs = require('fs');
const path = require("path")
module.exports.deleteImage = (fileName) => {
    const rootPath = path.dirname(require.main.filename);
    const deletePath = `${rootPath}/${fileName}`
    fs.rmSync(deletePath);

}