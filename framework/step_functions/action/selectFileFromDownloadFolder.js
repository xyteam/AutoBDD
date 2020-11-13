/**
 * Select an option of a select element
 * @param  {String}   fileName      File name
 */
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const screen_session = require('../../libs/screen_session');
module.exports = (fileName) => {
    const fileName_extSplit = fileName.split('.');
    const myFileExt = fileName_extSplit.length > 1 ? fileName_extSplit.pop() : null;
    const myFileName = fileName_extSplit.join('.');
    const myFilePath = globSync(getDownloadDir() + myFileName + '.' + myFileExt)[0]; // we only process the first match
    if (myFilePath) {
        console.log(myFilePath);
        screen_session.typeString(myFilePath);
        browser.pause(1000);
    } else {
        console.log(`${myFilePath} not found`)
    }
    screen_session.keyTap('enter');
};