/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  element   Element selector
 * @param  {Boolean} falseCase Check if the element (does not) exists
 * @param  {String}  exactly   Check if the element exists exactly this number (as string)
 *                             of times
 */
module.exports = (element, falseCase, exactly) => {
    /**
     * The number of elements found in the DOM
     * @type {Int}
     */
    const nrOfElements = browser.$$(element).value.length;

    if (falseCase === true) {
        expect(nrOfElements).toBe(
            0,
            `Element with selector "${element}" should not exist on the page`
        );
    } else if (exactly) {
        exactly = parseInt(exactly);
        expect(nrOfElements).toBe(
            exactly,
            `Element with selector "${element}" should exist exactly ` +
            `${exactly} time(s)`
        );
    } else {
        expect(nrOfElements).not.toBeLessThan(
            1,
            `Element with selector "${element}" should exist on the page`
        );
    }
};
