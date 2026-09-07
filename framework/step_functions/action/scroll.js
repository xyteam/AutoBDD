/**
 * Scroll the page to the given element
 * @param  {String}   selector Element selector
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = async (selector) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedSelector = parseExpectedText(selector);
    await (await browser.$(parsedSelector)).scrollIntoView();
};
