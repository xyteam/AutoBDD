/**
 * Check the title of the current browser window
 * @param  {String}   falseCase     Whether to check if the content equals the
 *                                  given text or not
 * @param  {String}   action        equals, contains or matches
 * @param  {String}   type          text or value
 * @param  {String}   expectedText  The text to validate against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (falseCase, action, type, expectedText) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var myExpectedText = parseExpectedText(expectedText);
    
    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty expectedText
    if (typeof myExpectedText === 'function') {
        myExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    // Check for empty expectedText in positive statement
    if (typeof myExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        myExpectedText = '';
        boolFalseCase = true;
    }

    const retrivedTitle = browser.getTitle();
    // console.log(`${type} : ${retrivedTitle}`)

    if (boolFalseCase) {
        switch (action) {
            case 'contain':
            case 'contains':
                expect(retrivedTitle).not.toContain(
                    myExpectedText,
                    `page title does not contain ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedTitle).not.toEqual(
                    myExpectedText,
                    `page title does not equal ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedTitle).not.toMatch(
                    RegExp(myExpectedText),
                    `page title does not match ${type} ` +
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
                expect(retrivedTitle).toContain(
                    myExpectedText,
                    `page title does contain ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedTitle).toEqual(
                    myExpectedText,
                    `page title does equal ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedTitle).toMatch(
                    RegExp(myExpectedText),
                    `page title does match ${type} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toBe(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

