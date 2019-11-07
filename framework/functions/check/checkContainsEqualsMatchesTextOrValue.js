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
    var parsedExpectedText = parseExpectedText(expectedText);

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
    if (typeof parsedExpectedText === 'function') {
        parsedExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    if (typeof parsedExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        parsedExpectedText = '';
        boolFalseCase = true;
    }

    const retrivedValue = browser[command](parsedElement).toString();
    // console.log(`${type} : ${retrivedValue}`)

    if (boolFalseCase) {
        switch (action) {
            case 'contains':
                expect(retrivedValue).not.toContain(
                    parsedExpectedText,
                    `element "${parsedElement}" should not contain ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    parsedExpectedText,
                    `element "${parsedElement}" should not equal ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    parsedExpectedText,
                    `element "${parsedElement}" should not match ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    } else {
        switch (action) {
            case 'contains':
                expect(retrivedValue).toContain(
                    parsedExpectedText,
                    `element "${parsedElement}" should contain ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).toEqual(
                    parsedExpectedText,
                    `element "${parsedElement}" should equal ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).toMatch(
                    parsedExpectedText,
                    `element "${parsedElement}" should match ${type} ` +
                    `"${parsedExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

