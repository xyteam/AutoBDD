/**
 * Check if the given element exists in the current DOM
 * @param  {String}   selector  Element selector
 * @param  {String}   falseCase Whether to check if the element exists or not
 */
module.exports = (selector, falseCase) => {
    /**
     * Elements found in the DOM
     * @type {Object}
     */
    const elements = browser.elements(selector).value;

    if (falseCase) {
        expect(elements.length).toBe(0, `Expected element "${selector}" not to exist`);
    } else {
        expect(elements.length).toBeGreaterThan(0, `Expected element "${selector}" to exist`);
    }
};
