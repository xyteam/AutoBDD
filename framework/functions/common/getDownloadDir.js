/**
 * Return the download directory for the browser
 */
module.exports = () => {
    /**
     * The number of elements found in the DOM
     * @type {String}
     */
    var downloadDir;
    if (process.env.DownloadPathLocal)
        downloadDir = process.env.DownloadPathLocal + '/';
    else if (browser.options.desiredCapabilities.chromeOptions.prefs.download &&
                browser.options.desiredCapabilities.chromeOptions.prefs.download.default_directory)
        downloadDir = browser.options.desiredCapabilities.chromeOptions.prefs.download.default_directory + '/';
    else if (browser.options.desiredCapabilities.chromeOptions.args.some(item => item.includes('--user-data-dir='))) {
        var downloadArgIndex = browser.options.desiredCapabilities.chromeOptions.args.findIndex(item => item.includes('--user-data-dir='));
        var downloadArg = browser.options.desiredCapabilities.chromeOptions.args[downloadArgIndex];
        downloadDir = downloadArg.substring(downloadArg.indexOf('/')) + '/';
    }
    else
        downloadDir = process.env.HOME + '/Downloads/';
    
    return downloadDir;
};
