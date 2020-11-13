/**
 * Check if the given element is visible inside the current viewport
 * @param  {String}   element   Element selector
 * @param  {String}   falseCase Whether to check if the element is visible
 *                              within the current viewport or not
 */
module.exports = (element, falseCase) => {
    /**
     * The state of visibility of the given element inside the viewport
     * @type {Boolean}
     */
    const isVisible = browser.$(element).isDisplayedInViewport();

    if (falseCase) {
        expect(isVisible).not.toBe(
                true,
                `Expected element "${element}" to be outside the viewport`
            );
    } else {
        expect(isVisible).toBe(
                true,
                `Expected element "${element}" to be inside the viewport`
            );
    }
};
