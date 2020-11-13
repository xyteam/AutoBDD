/**
 * Check if the given element is (not) visible
 * @param  {String}   partOf       some or all of
 * @param  {String}   element      Element selector
 * @param  {String}   waitAction   is or becomes, is we check immediately, becomes we wait for the element
 * @param  {String}   falseCase    Check for a visible or a hidden element
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (partOf, element, waitAction, falseCase) => {
    const myElement = parseExpectedText(element);
    const myPartOf = partOf || 'some';
    if (waitAction == 'becomes') {
        browser.$(myElement).waitForDisplayed(10000, !!falseCase);  
    }
    browser.pause(1000);
    const isVisible = browser.$(myElement).isDisplayed();
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
        expect(isVisible).not.toEqual(true, `Expected ${myPartOf} of element "${myElement}" not to be visible`);
    } else {
        expect(isVisible).toEqual(true, `Expected ${myPartOf} of element "${myElement}" to be visible`);
    }
};
