/**
 * Set the value of the given input field to a new value or add a value to the
 * current element value
 * @param  {String}   method    The method to use (add or set)
 * @param  {String}   isEnvVar  is environment variable
 * @param  {String}   value     The value to set the element to
 * @param  {String}   fieldType input or textarea
 * @param  {String}   element   Element selector
 */
const checkIfElementExists = require('../check/checkIfElementExists');
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (method, isEnvVar, value, fieldType, element) => {
    /**
     * The command to perform on the browser object (addValue or setValue)
     * @type {String}
     */
    const command = (method === 'add') ? 'addValue' : 'setValue';
    var inputValue = (!value) ? '' : (isEnvVar) ? eval('process.env.' + value) : parseExpectedText(value);

    checkIfElementExists(element, false, 1);

    const currentValue = (fieldType == 'inputfield') ? $(element).getValue() : $(element).getText()
    if (command == 'addValue') inputValue = currentValue + inputValue;
    $(element).setValue(inputValue);
};
