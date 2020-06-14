const checkIfElementExists = require('../check/checkIfElementExists');

/**
 * Set the value of the given input field to a new value or add a value to the
 * current element value
 * @param  {String}   method  The method to use (add or set)
 * @param  {String}   isEnvVar is environment variable
 * @param  {String}   value   The value to set the element to
 * @param  {String}   element Element selector
 */
module.exports = (method, isEnvVar, value, element) => {
    /**
     * The command to perform on the browser object (addValue or setValue)
     * @type {String}
     */
    const command = (method === 'add') ? 'addValue' : 'setValue';
    var inputValue = (!value) ? '' : (isEnvVar) ? eval('process.env.' + value) : value;

    checkIfElementExists(element, false, 1);

    if (command == 'addValue') inputValue = browser.$(element).getValue() + inputValue;
    browser.$(element).setValue(inputValue);
};
