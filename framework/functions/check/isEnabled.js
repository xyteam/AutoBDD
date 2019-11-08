/**
 * Check if the given element is enabled
 * @param  {String}   partOf    some or all of
 * @param  {String}   element   Element selector
 * @param  {String}   falseCase Whether to check if the given element is enabled
 *                              or not
 */
module.exports = (partOf, element, falseCase) => {
    const myPartOf = partOf || 'some';
    var isEnabled = browser.isEnabled(element);
    if (typeof isEnabled != boolean) {
        switch (myPartOf) {
            default:
            case 'some':
                isEnabled = isEnabled.some(item => item == true);
                break;
            case 'all':
                isEnabled = isEnabled.every(item => item == true);
                break;
        }
    }

    if (falseCase) {
        expect(isEnabled).not.toEqual(true, `Expected ${myPartOf} of element "${element}" not to be enabled`);
    } else {
        expect(isEnabled).toEqual(true, `Expected ${myPartOf} of element "${element}" to be enabled`);
    }
};
