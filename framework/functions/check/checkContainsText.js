/**
 * Check if the given elements contains text
 * @param  {String}   elementType   Element type (element or button)
 * @param  {String}   element       Element selector
 * @param  {String}   falseCase     Whether to check if the content contains
 *                                  the given text or not
 * @param  {String}   expectedText  The text to check against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (elementType, element, falseCase, expectedText) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedElement = parseExpectedText(element);

    /**
     * The expected text to validate against
     * @type {String}
     */
    var myExpectedText = parseExpectedText(expectedText);

    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command = 'getText';

    if (
        browser.$(parsedElement).getText() == '' &&
        browser.$(parsedElement).getAttribute('value') !== null
    ) {
        command = 'getValue';
    }

    /**
     * False case
     * @type {Boolean}
     */
    let boolFalseCase;

    /**
     * The text of the element
     * @type {String}
     */
    const text = browser.$(parsedElement)[command]();

    if (typeof expectedText === 'undefined') {
        myExpectedText = falseCase;
        boolFalseCase = false;
    } else {
        boolFalseCase = (falseCase === ' not');
    }

    if (boolFalseCase) {
        expect(text).not.toContain(myExpectedText);
    } else {
        expect(text).toContain(myExpectedText);
    }
};
