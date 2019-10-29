/**
 * Delete file from browser download directory
 * @param  {String}   targetName The base file name to be delete
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');

module.exports = (deleteType, fileName) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFileList = globSync(getDownloadDir() + myFileName + '.' + myFileExt);

    switch (deleteType) {
        case "all":
            try {
                myFileList.forEach(file => fs.unlinkSync(file));
            } catch(e) {}
            break;
        default:
        case "the only":
            fs.unlinkSync(myFileList[0]);
    }
};
