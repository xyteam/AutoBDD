/**
 * Clear a given input field (placeholder for WDIO's clearElement)
 * @param  {String}   element Element selector
 */
module.exports = (element) => {
    browser.scroll(element, 0, -200);
    browser.clearElement(element);
};
