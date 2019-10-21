/**
 * Open the given URL
 * @param  {String}   targetType targetType of navigation (url, file, site or download file)
 * @param  {String}   target The URL to navigate to
 */
const globSync = require("glob").sync;
const getDownloadDir = require('../common/getDownloadDir');

module.exports = (targetType, target) => {
    /**
     * The URL to navigate to
     * @targetType {String}
     */
    switch (targetType) {
        case "download file":
            var myFilePath = globSync(getDownloadDir() + '/' + target)[0]; // we take the first match
            browser.pause(2000);
            browser.url('file://' + myFilePath);
            browser.pause(3000);
            break;
        case "file":
            var myFilePath = globSync(target)[0]; // we take the first match
            browser.url('file://' + myFilePath);
            break;
        case "path":
            browser.url(browser.options.baseUrl + target);
            break;
        case "url":
        default:
            browser.url(target);
    }
};

