/**
 * Check if the given element is (not) visible
 * @param  {String}   partOf       some or all of
 * @param  {String}   element      Element selector
 * @param  {String}   waitAction   is or becomes, is we check immediately, becomes we wait for the element
 * @param  {String}   falseCase    Check for a visible or a hidden element
 */
module.exports = (partOf, element, waitAction, falseCase) => {
    const myPartOf = partOf || 'some';
    if (waitAction == 'becomes') {
        const ms = 10000;
        browser.waitForVisible(element, ms, !!falseCase);    
    }
    var isVisible = browser.isVisible(element);
    if (typeof isVisible != 'boolean') {
        switch (myPartOf) {
            default:
            case 'some':
                isVisible = isVisible.some(item => item == true);
                break;
            case 'all':
                isVisible = isVisible.every(item => item == true);
                break;
        }
    }

    if (falseCase) {
        expect(isVisible).not.toEqual(true, `Expected ${myPartOf} of element "${element}" not to be visible`);
    } else {
        expect(isVisible).toEqual(true, `Expected ${myPartOf} of element "${element}" to be visible`);
    }
};
