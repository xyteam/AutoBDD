/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  targetElement  Element selector
 * @param  {Boolean} falseCase      Check if the element (does not) exists
 * @param  {String}  parentElement  Element selector
 * @param  {String}  exactly        Check if the element exists exactly this number (as string)
 *                                  of times
 */
module.exports = (targetElement, falseCase, parentElement, exactly) => {
    const parentElementId = browser.element(parentElement).value.ELEMENT;
    /**
     * The number of elements found in the DOM
     * @type {Int}
     */
    const nrOfElements = browser.elementIdElements(parentElementId, targetElement).value;

    if (falseCase === true) {
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
