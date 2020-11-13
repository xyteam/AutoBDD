/**
 * Scroll the page to the given element
 * @param  {String}   selector Element selector
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (selector) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedSelector = parseExpectedText(selector);
    browser.$(parsedSelector).scrollIntoView();
};
