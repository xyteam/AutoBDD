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
    // Wait for the element before scrolling: a short page and a slow one look the same to a
    // blind scrollIntoView, so a page that has not rendered it yet produced a racing failure
    // (Chrome for Testing's chrome://version is long: the element can arrive after the
    // navigation returns). Same bounded wait the other act-on-element steps use.
    await (await browser.$(parsedSelector)).waitForExist({ timeout: 15000 });
    await (await browser.$(parsedSelector)).scrollIntoView();
};
