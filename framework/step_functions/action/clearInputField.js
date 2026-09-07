/**
 * Clear a given input field (placeholder for WDIO's clearElement)
 * @param  {String}   element Element selector
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = async (element) => {
    const parsedElement = parseExpectedText(element);
    await (await browser.$(parsedElement)).scrollIntoView();
    await (await browser.$(parsedElement)).clearValue();
};
