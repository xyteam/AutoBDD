/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  action             is, equals, contains or matches
 * @param  {String}  targetType         text or value
 * @param  {String}  expectedText       The text to validate against
 */

const parseExpectedText = require('../common/parseExpectedText');
const checkElement = (targetElementId, targetElementIndex, targetElement, parentElementIndex, parentElement, boolFalseCase, action, targetType, myExpectedText) => {
    var retrivedValue;
    switch (targetType) {
        case 'value':
            retrivedValue = browser.elementIdAttribute(targetElementId, targetType).value;
            break;
        case 'text':
        case 'regex':
            retrivedValue = browser.elementIdText(targetElementId).value;
    }
    if (boolFalseCase) {
        switch (action) {
        case 'displayed':
                expect(browser.elementIdDisplayed(targetElementId).value).not.toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not be ${action}`
                );        
                break;
            case 'enabled':
                expect(browser.elementIdEnabled(targetElementId).value).not.toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not be ${action}`
                );        
                break;
            case 'checked':
            case 'selected':
                expect(browser.elementIdSelected(targetElementId).value).not.toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not be ${action}`
                );        
                break;    
            case 'contain':
            case 'contains':
                expect(retrivedValue).not.toContain(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedValue).not.toMatch(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'displayed':
                expect(browser.elementIdDisplayed(targetElementId).value).toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should be ${action}`
                );        
                break;
            case 'enabled':
                expect(browser.elementIdEnabled(targetElementId).value).toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should be ${action}`
                );        
                break;
            case 'checked':
            case 'selected':
                expect(browser.elementIdSelected(targetElementId).value).toBe(
                    true,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should be ${action}`
                );        
                break;
            case 'contain':
            case 'contains':
                expect(retrivedValue).toContain(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).toEqual(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(retrivedValue).toMatch(
                    myExpectedText,
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toEqual(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

module.exports = (targetElementIndex, targetElement, parentElementIndex, parentElement, falseCase, action, targetType, expectedText) => {
    var myExpectedText = parseExpectedText(expectedText);
    var boolFalseCase = !!falseCase;
    // Check for empty element
    if (typeof myExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        myExpectedText = '';
        boolFalseCase = true;
    } else if (typeof myExpectedText === 'function') {
        myExpectedText = '';
        boolFalseCase = !boolFalseCase;
    }
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : -1;

    var targetElementId;
    if (parentElement) {
        if (parentElementIndexInt >= 0) {
            const parentElementId = browser.elements(parentElement).value[parentElementIndexInt].ELEMENT;
            targetElementId = browser.elementIdElements(parentElementId, targetElement).value[targetElementIndexInt].ELEMENT;
            checkElement(targetElementId, targetElementIndex, targetElement, parentElementIndex, parentElement, boolFalseCase, action, targetType, myExpectedText);
        } else {
            browser.elements(parentElement).value.forEach((pElement, pIndex) => {
                const parentElementId = pElement.ELEMENT;
                targetElementId = browser.elementIdElements(parentElementId, targetElement).value[targetElementIndexInt].ELEMENT;
                checkElement(targetElementId, targetElementIndex, targetElement, pIndex + 1, parentElement, boolFalseCase, action, targetType, myExpectedText);    
            });
        }
    } else {
        targetElementId = browser.elements(targetElement).value[targetElementIndexInt].ELEMENT;
        checkElement(targetElementId, targetElementIndex, targetElement, parentElementIndex, null, boolFalseCase, action, targetType, myExpectedText);
    }
};

