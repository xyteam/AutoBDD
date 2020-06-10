/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  action             equals, contains or matches
 * @param  {String}  targetType         text or value
 * @param  {String}  expectedText       The text to validate against
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports = (targetElementIndex, targetElement, parentElementIndex, parentElement, falseCase, action, targetType, expectedText) => {
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    
    var targetElementId;
    if (parentElement) {
        const parentElementId = browser.$$(parentElement)[parentElementIndexInt].elementId;
        targetElementId = browser.elementIdElements(parentElementId, targetElement).value[targetElementIndexInt].ELEMENT;
    } else {
        targetElementId = browser.$$(targetElement)[targetElementIndexInt].elementId;
    }

    /**
     * The expected text to validate against
     * @type {String}
     */
    var myExpectedText = parseExpectedText(expectedText);

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

    if (typeof myExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        myExpectedText = '';
        boolFalseCase = true;
    }

    var retrivedValue;
    switch (targetType) {
        case 'value':
            retrivedValue = browser.elementIdAttribute(targetElementId, targetType).value;
            break;
        case 'text':
        default:
            retrivedValue = browser.getElementText(targetElementId);
    }

    retrivedValue = retrivedValue.replace(/[^\x00-\x7F]/g, '');
    const myRegex = RegExp(myExpectedText);

    if (boolFalseCase) {
        switch (action) {
            case 'contain':
            case 'contains':
                expect(retrivedValue).not.toContain(
                    myExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).not.toEqual(
                    myExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(myRegex.test(retrivedValue)).not.toEqual(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should not match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toEqual(true, `action ${action} should be one of contains, equals or matches`);
        }
    } else {
        switch (action) {
            case 'contain':
            case 'contains':
                expect(retrivedValue).toContain(
                    myExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}" should contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                expect(retrivedValue).toEqual(
                    myExpectedText,
                    `target element "${targetElement}" inside parent element "${parentElement}" should equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                expect(myRegex.test(retrivedValue)).toEqual(
                    true,
                    `target element "${targetElement}" inside parent element "${parentElement}" should match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toEqual(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
};


