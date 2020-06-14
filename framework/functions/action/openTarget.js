/**
 * Open the given URL
 * @param  {String}   targetType targetType of navigation (url, file, site or download file)
 * @param  {String}   targetName The URL to navigate to
 */
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (targetType, targetName) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedTargetName = parseExpectedText(targetName);
    var fileTarget;
    var urlTarget;

    switch (targetType) {
        case "download file":
            fileTarget = getDownloadDir() + parsedTargetName.replace(/ /g, '\\ ');
            urlTarget = encodeURI('file://' + globSync(fileTarget)[0]); // we take the first match
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "file":
            fileTarget = parsedTargetName.replace(/^~\//, process.env.HOME + '/').replace(/ /g, '\ ');
            urlTarget = encodeURI('file://' + globSync(fileTarget)[0]); // we take the first match
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "path":
            urlTarget = encodeURI(browser.options.baseUrl + parsedTargetName);
            console.log(urlTarget)
            browser.url(urlTarget);
            break;
        case "url":
        default:
            urlTarget = encodeURI(parsedTargetName);
            try {
                console.log(urlTarget)
                browser.url(urlTarget);
            } catch (e) {
                console.log(e.message);
            }
        }
};

