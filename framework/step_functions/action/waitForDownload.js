/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   targetName               Download file name
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseState               Check for opposite state
 */
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
module.exports = (targetName, ms, falseState) => {
    let fileTarget = getDownloadDir() + targetName.replace(/ /g, '\\ ');
    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {Int}
     */
    const intMs = parseInt(ms, 10) || 5000;

    /**
     * Boolean interpretation of the false state
     * @type {Boolean}
     */
    let boolFalseState = !!falseState;

    var timeOut = false;
    var handle = setInterval(() => {
        console.log(`wait timeout: ${fileTarget}, ${intMs} ms`);
        timeOut = true;
    }, intMs);
    if (boolFalseState) {
        while (globSync(fileTarget)[0] && !timeOut) {
            browser.pause(3000);
        }
    } else {
        while (!globSync(fileTarget)[0] && !timeOut) {
            browser.pause(3000);
        }
    }
    clearInterval(handle);
    browser.pause(2000);
};
