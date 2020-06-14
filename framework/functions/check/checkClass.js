/**
 * Check if the given element has the given class
 * @param  {String}   element              Element selector
 * @param  {String}   falseCase         Whether to check for the class to exist
 *                                      or not ('has', 'does not have')
 * @param  {String}   expectedClassName The class name to check
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (element, falseCase, expectedClassName) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedElement = parseExpectedText(element);

    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedExpectedClassName = parseExpectedText(expectedClassName);

    /**
     * List of all the classes of the element
     * @type {Array}
     */
    const classesList = browser.$(parsedElement).getAttribute('className');
    console.log(classesList)

    if (falseCase === 'does not have') {
        expect(classesList).not.toContain(
                parsedExpectedClassName,
                `Element ${parsedElement} should not have the class ${parsedExpectedClassName}`
            );
    } else {
        expect(classesList).toContain(
                parsedExpectedClassName,
                `Element ${parsedElement} should have the class ${parsedExpectedClassName}`
            );
    }
};
