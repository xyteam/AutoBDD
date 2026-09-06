/**
 * Check if the given element has the given class
 * @param  {String}   element              Element selector
 * @param  {String}   falseCase         Whether to check for the class to exist
 *                                      or not ('has', 'does not have')
 * @param  {String}   expectedClassName The class name to check
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = async (element, falseCase, expectedClassName) => {
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
    // getAttribute('class') is null when the element has no class attribute at all;
    // treat that as "no classes" so 'does not have' assertions pass.
    const classesList = (await (await browser.$(parsedElement)).getAttribute('class')) || '';

    if (falseCase === 'does not have') {
        await expect(classesList).not.toContain(
                parsedExpectedClassName,
                `Element ${parsedElement} should not have the class ${parsedExpectedClassName}`
            );
    } else {
        await expect(classesList).toContain(
                parsedExpectedClassName,
                `Element ${parsedElement} should have the class ${parsedExpectedClassName}`
            );
    }
};
