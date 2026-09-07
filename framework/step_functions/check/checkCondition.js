/**
 * Check if the given element is (not) visible
 * @param  {String}   partOf       some or all of
 * @param  {String}   element      Element selector
 * @param  {String}   verb         is or become, becomes
 * @param  {String}   falseCase    fasle case
 * @param  {String}   state        checked element state
 */
const parseExpectedText = require('../common/parseExpectedText');
module.exports = async (partOf, element, verb, falseCase, state) => {
    const myElem = parseExpectedText(element);
    const myPartOf = partOf || 'some';
    var checkAction = `is${state.charAt(0).toUpperCase()}${state.slice(1)}`;
    // "is visible" means CSS-visible (not hidden), not necessarily within the
    // current scroll viewport - use isDisplayed() so an off-screen but shown
    // element is still 'visible'.
    if (checkAction == 'isVisible') checkAction = 'isDisplayed';
    if (checkAction == 'isChecked') checkAction = 'isSelected';
    var myResult;
    if (verb.includes('become')) {
        if ((await (await browser.$(myElem))[checkAction]()) == !!falseCase) {
            var waitAction = `waitFor${state.charAt(0).toUpperCase()}${state.slice(1)}`;
            if (waitAction == 'waitForVisible') waitAction = 'waitForDisplayed';
            if (waitAction == 'waitForChecked') waitAction = 'waitForClickable';
            if (waitAction == 'waitForSelected') waitAction = 'waitForSelected';
            if (waitAction == 'waitForExisting') waitAction = 'waitForExist';        
            const waitOption = {timeout: 5000, reverse: !!falseCase};
            await (await browser.$(myElem))[waitAction](waitOption);
        }
    }
    myResult = await (await browser.$(myElem))[checkAction]();
    if (typeof(myResult) == 'object') {
        switch (myPartOf) {
            default:
            case 'some':
                myResult = myResult.some(item => item == true);
                break;
            case 'all':
                myResult = myResult.every(item => item == true);
                break;
        }
    }

    await expect(myResult).toBe(!falseCase, `Expected ${myPartOf} of element "${myElem}" ${verb}${falseCase} ${state} but failed`);
};
