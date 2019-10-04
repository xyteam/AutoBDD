/**
 * Check if the given elements text is the same as the given text
 * @param  {String}   elementType   Element type (element or button)
 * @param  {String}   element       Element selector
 * @param  {String}   action        is, contains or matches
 * @param  {String}   falseCase     Whether to check if the content equals the
 *                                  given text or not
 * @param  {String}   expectedText  The text to validate against
 */
module.exports = (elementType, element, action, falseCase, expectedText) => {
    /**
     * The command to execute on the browser object
     * @type {String}
     */
    let command = 'getValue';

    if (
        elementType === 'button' ||
        browser.getAttribute(element, 'value') === null
    ) {
        command = 'getText';
    }

    /**
     * The expected text to validate against
     * @type {String}
     */
    let parsedExpectedText = expectedText;

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

    if (parsedExpectedText === undefined && falseCase === undefined) {
        parsedExpectedText = '';
        boolFalseCase = true;
    }

    const retrivedValue = browser[command](element);

    if (boolFalseCase) {
        switch (action) {
            case 'contains':
                expect(retrivedValue).not.toContain(
                    parsedExpectedText,
                    `element "${element}" should not contain ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    parsedExpectedText,
                    `element "${element}" should not equal ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    parsedExpectedText,
                    `element "${element}" should not match ` +
                    `"${retrivedValue}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'contains':
                expect(retrivedValue).toContain(
                    parsedExpectedText,
                    `element "${element}" should contain ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'equals':
                expect(retrivedValue).toEqual(
                    parsedExpectedText,
                    `element "${element}" should equal ` +
                    `"${retrivedValue}"`
                );        
                break;
            case 'matches':
                expect(retrivedValue).toMatch(
                    parsedExpectedText,
                    `element "${element}" should match ` +
                    `"${retrivedValue}"`
                );        
                break;
        }
    }
}