/**
 * Check if the given element is enabled
 * @param  {String}   partOf       some or all of
 * @param  {String}   element      Element selector
 * @param  {String}   waitAction   is or becomes, is we check immediately, becomes we wait for the element
 * @param  {String}   falseCase    Whether to check if the given element is enabled
 *                                 or not
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = (partOf, element, waitAction, falseCase) => {
    const myElement = parseExpectedText(element);
    const myPartOf = partOf || 'some';
    if (waitAction == 'becomes') {
        const ms = 10000;
        browser.waitForEnabled(myElement, ms, !!falseCase);    
    }
    var isEnabled = browser.$(myElement).isEnabled();
    if (typeof isEnabled != 'boolean') {
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
        expect(isEnabled).not.toEqual(true, `Expected ${myPartOf} of element "${myElement}" not to be enabled`);
    } else {
        expect(isEnabled).toEqual(true, `Expected ${myPartOf} of element "${myElement}" to be enabled`);
    }
};
