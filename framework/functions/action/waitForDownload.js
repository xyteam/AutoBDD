/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   targetName               Download file name
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseState               Check for opposite state
 */
const fs = require('fs');
const getDownloadDir = require('../common/getDownloadDir');
module.exports = (targetName, ms, falseState) => {
    let downloadDir = getDownloadDir();
    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {Int}
     */
    const intMs = parseInt(ms, 10) || 3000;

    /**
     * Boolean interpretation of the false state
     * @type {Boolean}
     */
    let boolFalseState = !!falseState;

    const downloadFileFullPath = downloadDir + '/' + targetName;
    var timeOut = false;
    var handle = setInterval(() => {
        console.log('download timeout: ' + downloadFileFullPath);
        timeOut = true;
    }, ms);
    if (boolFalseState) {
        while (fs.existsSync(downloadFileFullPath) && !timeOut) {
            browser.pause(3000);
        }
    } else {
        while (!fs.existsSync(downloadFileFullPath) && !timeOut) {
            browser.pause(3000);
        }
    }
    clearInterval(handle);
    browser.pause(2000);
};
