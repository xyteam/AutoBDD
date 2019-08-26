/**
 * Open the given URL
 * @param  {String}   targetType targetType of navigation (url, file, site or download file)
 * @param  {String}   target The URL to navigate to
 */
const getDownloadDir = require('../common/getDownloadDir');
const fs = require('fs');
module.exports = (targetType, target) => {
    /**
     * The URL to navigate to
     * @targetType {String}
     */
    switch (targetType) {
        case "download file":
            let downloadDir = getDownloadDir();
            browser.pause(2000);
            browser.url('file://' + downloadDir + target);
            browser.pause(3000);
            break;
        case "file":
            browser.url('file://' + target);
            break;
        case "path":
            browser.url(browser.options.baseUrl + target);
            break;
        case "url":
        default:
            browser.url(target);
    }
};
