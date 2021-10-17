/**
 * Compare the contents of two elements with each other
 * @param  {String}   element1  Element selector for the first element
 * @param  {String}   falseCase Whether to check if the contents of both
 *                              elements match or not
 * @param  {String}   element2  Element selector for the second element
 */
module.exports = async (element1, falseCase, element2) => {
    /**
     * The text of the first element
     * @type {String}
     */
    const text1 = browser.$(element1).getText();

    /**
     * The text of the second element
     * @type {String}
     */
    const text2 = browser.$(element2).getText();

    if (falseCase) {
        expect(text1).not.toEqual(
            text2,
            `Expected text not to be "${text1}"`
        );
    } else {
        expect(text1).toEqual(
            text2,
            `Expected text to be "${text1}" but found "${text2}"`
        );
    }
};
