/**
 * Check if the given elements contains text
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

    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command = 'getText'
    
    if (type == 'value') {
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
    const text = browser[command](parsedElement);

    if (typeof falseCase === 'undefined' || falseCase == null) {
        boolFalseCase = false;
    } else {
        boolFalseCase = !!falseCase;
    }

    if (boolFalseCase) {
        expect(text).toEqual('');
    } else {
        expect(text).not.toEqual('');
    }
};
