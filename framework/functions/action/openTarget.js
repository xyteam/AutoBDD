/**
 * Open the given URL
 * @param  {String}   targetType targetType of navigation (url, file, site or download file)
 * @param  {String}   targetName The URL to navigate to
 */
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');

module.exports = (targetType, targetName) => {
    var fileTarget;
    var urlTarget
    switch (targetType) {
        case "download file":
            fileTarget = getDownloadDir() + targetName.replace(/ /g, '\\ ');
            urlTarget = encodeURI('file://' + globSync(fileTarget)[0]); // we take the first match
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "file":
            fileTarget = targetName.replace(/ /g, '\ ');
            urlTarget = encodeURI('file://' + globSync(myTarget)[0]); // we take the first match
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "path":
            urlTarget = encodeURI(browser.options.baseUrl + targetName);
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "url":
        default:
            urlTarget = encodeURI(targetName);
            console.log(urlTarget)
            browser.url(urlTarget);
        }
};

