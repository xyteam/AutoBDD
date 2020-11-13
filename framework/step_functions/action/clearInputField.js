/**
 * Clear a given input field (placeholder for WDIO's clearElement)
 * @param  {String}   element Element selector
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (element) => {
    const parsedElement = parseExpectedText(element);
    browser.$(parsedElement).scrollIntoView();
    browser.$(parsedElement).clearValue();
};
