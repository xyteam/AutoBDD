/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  targetElement  Element selector
 * @param  {String}  parentElement  Element selector
 * @param  {Boolean} falsCase Check if the element (does not) exists
 * @param  {String}  exactly  Check if the element exists exactly this number (as string)
 *                            of times
 */
module.exports = (targetElement, parentElement, falsCase, exactly) => {
    /**
     * The number of elements found in the DOM
     * @type {Int}
     */
    const nrOfElements = browser.elements(targetElement).value;

    if (falsCase === true) {
        expect(nrOfElements.length).toBe(
            0,
            `Element with selector "${targetElement}" should not exist inside "${parentElement}"`
        );
    } else if (exactly) {
        exactly = parseInt(exactly);
        expect(nrOfElements.length).toBe(
            exactly,
            `Element with selector "${targetElement}" should exist exactly ` +
            `${exactly} time(s) inside "${parentElement}"`
        );
    } else {
        expect(nrOfElements.length).not.toBeLessThan(
            1,
            `Element with selector "${targetElement}" should exist inside "${parentElement}"`
        );
    }
};
