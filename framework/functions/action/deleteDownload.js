/**
 * Delete file from browser download directory
 * @param  {String}   deleteType the only or all
 * @param  {String}   targetName The base file name to be delete
 */
const fs = require('fs');
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
module.exports = (deleteType, targetName) => {
    let downloadDir = getDownloadDir();
    // detech fileName and fileExt
    var fileName, fileExt;
    if (targetName.includes('.')) {
        fileName = targetName.substring(0, targetName.lastIndexOf('.'));
        fileExt = targetName.substring(targetName.lastIndexOf('.') + 1);
    }
    switch (deleteType) {
        case "all":
            var files = globSync(downloadDir + fileName + '\ \([0-9]*\)' + '\.' + fileExt);
            // delete all files with index
            try {
                files.forEach(file => fs.unlinkSync(file));
            } catch(e) {}
            
            // delete the file without index
            try {
                fs.unlinkSync(downloadDir + targetName);
            } catch(e) {}
            break;
        default:
        case "the only":
            fs.unlinkSync(downloadDir + targetName);
            break;
    }
};
