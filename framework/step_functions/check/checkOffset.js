/**
 * Check the offset of the given element
 * @param  {String}   elem              Element selector
 * @param  {String}   falseCase         Whether to check if the offset matches
 *                                      or not
 * @param  {String}   expectedPosition  The position to check against
 * @param  {String}   axis              The axis to check on (x or y)
 */
module.exports = async (elem, falseCase, expectedPosition, axis) => {
    /**
     * Get the location of the element on the given axis
     * @type {[type]}
     */
    // getLocation may return a sub-pixel value (e.g. 1084.59375 vs an expected
    // CSS position of 1084). Compare within a small tolerance so sub-pixel
    // rendering does not fail an otherwise-correct position check.
    const location = await (await browser.$(elem)).getLocation(axis);
    const tolerance = 1; // allow up to 1px sub-pixel drift

    /**
     * Parsed expected position
     * @type {Int}
     */
    var intExpectedPosition = parseFloat(expectedPosition, 10);

    if (process.env.DISPLAY.split(':')[1].length > 1) {
        if (axis == 'x') intExpectedPosition = intExpectedPosition + parseInt(process.env.XVFB_CHROME_PIXEL_OFFSET_X);
        if (axis == 'y') intExpectedPosition = intExpectedPosition + parseInt(process.env.XVFB_CHROME_PIXEL_OFFSET_Y);
    }
    const matches = Math.abs(location - intExpectedPosition) <= tolerance;
    if (falseCase) {
        await expect(matches).toBe(false,
                `Element "${elem}" should not be positioned at ` +
                `${intExpectedPosition}px on the ${axis} axis, but was found ` +
                `at ${location}px`
            );
    } else {
        await expect(matches).toBe(true,
                `Element "${elem}" should be positioned at ` +
                `${intExpectedPosition}px on the ${axis} axis, but was found ` +
                `at ${location}px`
            );
    }
};
