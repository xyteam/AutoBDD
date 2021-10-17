/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  expectedStauts     displayed, enabled or selected
 */

const parseExpectedText = require('../common/parseExpectedText');
module.exports = async (targetElementIndex, targetElement, parentElementIndex, parentElement, falseCase, expectedStauts) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    
    var targetElementIdElement;
    if (parentElement) {
        $(myParentElement).waitForExist();
        targetElementIdElement = browser.$$(myParentElement)[parentElementIndexInt].$$(myTargetElement)[targetElementIndexInt];
    } else {
        targetElementIdElement = browser.$$(myTargetElement)[targetElementIndexInt];
    }

    /**
     * Whether to check if the content equals the given text or not
     * @type {Boolean}
     */
    let boolFalseCase = !!falseCase;

    // Check for empty element
    if (typeof myExpectedText === 'function') {
        myExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }

    if (boolFalseCase) {
        switch (expectedStauts) {
            case 'displayed':
                expect(targetElementIdElement.isDisplayed()).not.toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not be ${expectedStauts}`
                );        
                break;
            case 'enabled':
                expect(targetElementIdElement.isEnabled()).not.toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not be ${expectedStauts}`
                );        
                break;
            case 'checked':
            case 'selected':
                expect(targetElementIdElement.isSelected()).not.toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not be ${expectedStauts}`
                );        
                break;
            default:
                expect(false).toEqual(true, `expectedStauts ${expectedStauts} should be one of displayed, enabled or selected`);
        }
    } else {
        switch (expectedStauts) {
            case 'displayed':
                expect(targetElementIdElement.isDisplayed()).toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should be ${expectedStauts}`
                );        
                break;
            case 'enabled':
                expect(targetElementIdElement.isEnabled()).toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should be ${expectedStauts}`
                );        
                break;
            case 'checked':
            case 'selected':
                expect(targetElementIdElement.isSelected()).toBe(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should be ${expectedStauts}`
                );        
                break;
            default:
                expect(false).toEqual(true, `expectedStauts ${expectedStauts} should be one of displayed, enabled or selected`);
        }
    }
};


