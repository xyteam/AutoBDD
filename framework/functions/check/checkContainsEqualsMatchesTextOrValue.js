/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   element       Element selector
 * @param  {String}   falseCase     Whether to check if the content equals the
 *                                  given text or not
 * @param  {String}   action        equals, contains or matches
 * @param  {String}   type          text or value
 * @param  {String}   expectedText  The text to validate against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (element, falseCase, action, type, expectedText) => {
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
     * The command to execute on the browser object
     * @type {String}
     */
    
    let command = 'getText'
    
    if (type == 'value') {
        command = 'getValue';
    } 

    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty element
    if (typeof myExpectedText === 'function') {
        myExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    if (typeof myExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        myExpectedText = '';
        boolFalseCase = true;
    }

    const retrivedValue = browser.$(parsedElement)[command]().toString();
    // console.log(`${type} : ${retrivedValue}`)

    if (boolFalseCase) {
        switch (action) {
            case 'contain':
            case 'contains':
                expect(retrivedValue).not.toContain(
                    myExpectedText,
                    `element "${parsedElement}" should not contain ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    myExpectedText,
                    `element "${parsedElement}" should not equal ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    RegExp(myExpectedText),
                    `element "${parsedElement}" should not match ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    } else {
        switch (action) {
            case 'contain':
            case 'contains':
                expect(retrivedValue).toContain(
                    myExpectedText,
                    `element "${parsedElement}" should contain ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).toEqual(
                    myExpectedText,
                    `element "${parsedElement}" should equal ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedValue).toMatch(
                    RegExp(myExpectedText),
                    `element "${parsedElement}" should match ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

