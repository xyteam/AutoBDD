/**
 * Check the offset of the given element
 * @param  {String}   elem              Element selector
 * @param  {String}   falseCase         Whether to check if the offset matches
 *                                      or not
 * @param  {String}   expectedPosition  The position to check against
 * @param  {String}   axis              The axis to check on (x or y)
 */
module.exports = (elem, falseCase, expectedPosition, axis) => {
    /**
     * Get the location of the element on the given axis
     * @type {[type]}
     */
    const location = browser.$(elem).getLocation(axis);

    /**
     * Parsed expected position
     * @type {Int}
     */
    var intExpectedPosition = parseFloat(expectedPosition, 10);

    if (process.env.DISPLAY.split(':')[1].length > 1) {
        if (axis == 'x') intExpectedPosition = intExpectedPosition + parseInt(process.env.XVFB_CHROME_PIXEL_OFFSET_X);
        if (axis == 'y') intExpectedPosition = intExpectedPosition + parseInt(process.env.XVFB_CHROME_PIXEL_OFFSET_Y);
    }
    if (falseCase) {
        expect(location).not.toEqual(
                intExpectedPosition,
                `Element "${elem}" should not be positioned at ` +
                `${intExpectedPosition}px on the ${axis} axis`
            );
    } else {
        expect(location).toEqual(
                intExpectedPosition,
                `Element "${elem}" should be positioned at ` +
                `${intExpectedPosition}px on the ${axis} axis, but was found ` +
                `at ${location}px`
            );
    }
};
