/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  element   Element selector
 * @param  {Boolean} falseCase Check if the element (does not) exists
 * @param  {String}  atLest    Check if the element exists atLest this number (as string)
 *                             of times
 */
module.exports = (element, falseCase, atLest) => {
    const myAtLeast = atLest || 1;
    /**
     * The number of elements found in the DOM
     * @type {Int}
     */
    const nrOfElements = browser.$$(element).length;

    if (falseCase === true) {
        expect(nrOfElements).toBe(
            0,
            `Element with selector "${element}" should not exist on the page`
        );
    } else {
        expect(nrOfElements).not.toBeLessThan(
            myAtLeast,
            `Element with selector "${element}" should exist on at least ${myAtLeast} times the page`
        );
    }
};
