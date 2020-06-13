/**
 * Check if the given elements contains retrivedValue
 * @param  {String}   element       Element selector
 * @param  {String}   falseCase     Whether to check if the content contains
 *                                  text or not
 * @param  {String}   type          text or value
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (element, falseCase, type) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedElement = parseExpectedText(element);
    var retrivedValue;
    if (type == 'value') {
        retrivedValue = browser.$(parsedElement).getValue();
    } else {
        retrivedValue = browser.$(parsedElement).getText();
    }

    if (!!falseCase) {
        expect(retrivedValue).toEqual('');
    } else {
        expect(retrivedValue).not.toEqual('');
    }
};
