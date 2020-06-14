/**
 * Assign text of an element to a env string
 * @param  {String}  type               text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  varName            variable name
 */

const parseExpectedText = require('../common/parseExpectedText');
module.exports = (type, targetElementIndex, targetElement, parentElementIndex, parentElement, varName) => {
    // Check for empty element
    if (typeof myExpectedText === 'undefined') {
        myExpectedText = '';
    } else if (typeof myExpectedText === 'function') {
        myExpectedText = '';
    }
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : -1;

    var targetElementIdElement;
    if (parentElement) {
        targetElementIdElement = browser.$$(parentElement)[parentElementIndexInt].$$(targetElement)[targetElementIndexInt];
    } else {
        targetElementIdElement = browser.$$(targetElement)[targetElementIndexInt];
    }
    const retrivedValue = browser.$(targetElementIdElement).getText();
    process.env[varName] = (type == 'number') ? retrivedValue.match(/\d+/)[0] : retrivedValue;
    console.log(`assigned "${process.env[varName]}" to ENV:${varName}`);
};

