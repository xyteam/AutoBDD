/**
 * Set the value of the given input field to a new value or add a value to the
 * current element value
 * @param  {String}   method             The method to use (add or set)
 * @param  {String}   isEnvVar           is environment variable
 * @param  {String}   value              The value to set the element to
 * @param  {String}   targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}   fieldType          input or textarea
 * @param  {String}   targetElement      target element selector
 * @param  {String}   parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}   parentElement      parent element selector
 * @param  {String}   containsTheText    containing text that identifies the parent element
 */
const checkIfElementExists = require('../check/checkIfElementExists');
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (method, isEnvVar, value, targetElementIndex, fieldType, targetElement, parentElementIndex, parentElement, containsTheText) => {
    /**
     * The command to perform on the browser object (addValue or setValue)
     * @type {String}
     */
    const command = (method === 'add') ? 'addValue' : 'setValue';
    var inputValue = (!value) ? '' : (isEnvVar) ? eval('process.env.' + value) : parseExpectedText(value);
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const myContainsTheText = parseExpectedText(containsTheText) || '';
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    
    var targetElementIdElement;
    if (parentElement) {
        $(myParentElement).waitForExist();
        const myFilteredParentElement = $$(myParentElement).filter(elem => elem.getText().includes(myContainsTheText));
        const targetParentElement = (parentElementIndex == 'last') ? myFilteredParentElement.slice(-1) : myFilteredParentElement[parentElementIndexInt];
        targetElementIdElement = (targetElementIndex == 'last') ? targetParentElement.$$(myTargetElement).slice(-1) : targetParentElement.$$(myTargetElement)[targetElementIndexInt];
    } else {
        targetElementIdElement = (targetElementIndex == 'last') ? $$(myTargetElement).slice(-1) : $$(myTargetElement)[targetElementIndexInt];
    }

    const currentValue = (fieldType == 'inputfield') ? targetElementIdElement.getValue() : targetElementIdElement.getText()
    if (command == 'addValue') inputValue = currentValue + inputValue;
    targetElementIdElement.setValue(inputValue);
};
