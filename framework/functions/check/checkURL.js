/**
 * Check the URL of the given browser window
 * @param  {String}   falseCase   Whether to check if the URL matches the
 *                                expected value or not
 * @param  {String}   expectedUrl The expected URL to check against
 */
module.exports = (falseCase, expectedUrl) => {
    /**
     * The current browser window's URL
     * @type {String}
     */
    const currentUrl = browser.url().value;
    var myExpectedUrl = (expectedUrl.match('^http[s]*://')) ? expectedUrl : browser.options.baseUrl + expectedUrl

    if (falseCase) {
        expect(currentUrl).not.toEqual(myExpectedUrl, `expected url not to be "${currentUrl}"`);
    } else {
        expect(currentUrl).toEqual(
            myExpectedUrl,
                `expected url to be "${myExpectedUrl}" but found ` +
                `"${currentUrl}"`
            );
    }
};
