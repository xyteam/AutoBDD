/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  compareAction      compare action: more than, less than, exactly
 * @param  {String}  expectedNumber     Check if the element exists this number (as string) of times
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (targetElement, parentElementIndex, parentElement, falseCase, compareAction, expectedNumber) => {
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    const myExpectedNumber = (expectedNumber) ? parseInt(parseExpectedText(expectedNumber)) : (falseCase) ? 0 : 1;
    const myCompareAction = compareAction || ((falseCase) ? 'no more than' : 'no less than');

    var appearanceNumber;
    if (parentElement) {
        appearanceNumber = browser.$$(parentElement)[parentElementIndexInt].$$(targetElement).length;
    } else {
        appearanceNumber = browser.$$(targetElement).length;
    }

    switch (myCompareAction) {
        case 'exactly':
            expect(appearanceNumber).toEqual(myExpectedNumber);
            break;
        case 'not exactly':
            expect(falseCase).toBe(null, 'cannot use double negative expression');
            expect(appearanceNumber).not.toEqual(myExpectedNumber);
            break;
        case 'more than':
            expect(appearanceNumber).toBeGreaterThan(myExpectedNumber);
            break;
        case 'no more than':
            expect(appearanceNumber).not.toBeGreaterThan(myExpectedNumber);
            break;
        case 'less than':
            expect(appearanceNumber).toBeLessThan(myExpectedNumber);
            break;
        case 'no less than':
            expect(falseCase).toBe(null, 'cannot use double negative expression');
            expect(appearanceNumber).not.toBeLessThan(myExpectedNumber);
            break;
    }    
};
