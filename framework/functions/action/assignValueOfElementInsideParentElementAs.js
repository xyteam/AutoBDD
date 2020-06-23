/**
 * Assign text of an element to a env string
 * @param  {String}  type               text, value or number
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  varName            variable name
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (type, targetElementIndex, targetElement, parentElementIndex, parentElement, varName) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;

    const getWhat = (type == 'value') ? 'getValue' : 'getText';
    var retrivedValue;
    if (parentElement) {
        $(myParentElement).waitForExist();
        retrivedValue = $$(myParentElement)[parentElementIndexInt].$$(myTargetElement)[targetElementIndexInt][getWhat]();
    } else {
        retrivedValue = $$(myTargetElement)[targetElementIndexInt][getWhat]();
    }
    process.env[varName] = (type == 'number') ? retrivedValue.match(/\d+/)[0] : retrivedValue;
    console.log(`assigned "${process.env[varName]}" to ENV:${varName}`);
};

