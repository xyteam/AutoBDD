/**
 * Check the dimensions of the given element
 * @param  {String}   element      Element selector
 * @param  {String}   falseCase    Whether to check if the dimensions match or
 *                                 not
 * @param  {String}   expectedSize Expected size
 * @param  {String}   dimension    Dimension to check (broad or tall)
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (element, falseCase, expectedSize, dimension) => {
    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedElement = parseExpectedText(element);

    /**
     * The expected text to validate against
     * @type {String}
     */
    var parsedExpectedSize = parseExpectedText(expectedSize);

    /**
     * The size of the given element
     * @type {Object}
     */
    const elementSize = browser.$(parsedElement).getSize();

    /**
     * Parsed size to check for
     * @type {Int}
     */
    const intExpectedSize = parseInt(parsedExpectedSize, 10);

    /**
     * The size property to check against
     * @type {Int}
     */
    let originalSize = elementSize.height;

    /**
     * The label of the checked property
     * @type {String}
     */
    let label = 'height';

    if (dimension === 'broad') {
        originalSize = elementSize.width;
        label = 'width';
    }

    if (falseCase) {
        expect(originalSize).not.toEqual(
                intExpectedSize,
                `Element "${parsedElement}" should not have a ${label} of ` +
                `${intExpectedSize}px`
            );
    } else {
        expect(originalSize).toEqual(
                intExpectedSize,
                `Element "${parsedElement}" should have a ${label} of ` +
                `${intExpectedSize}px, but is ${originalSize}px`
            );
    }
};
