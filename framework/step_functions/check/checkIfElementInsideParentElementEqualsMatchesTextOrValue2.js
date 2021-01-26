/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  containsTheText    containing text that identifies the parent element
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  action             is, equals, contains or matches
 * @param  {String}  targetType         text or value
 * @param  {String}  expectedText       The text to validate against
 */

const parseExpectedText = require('../common/parseExpectedText');
const checkElement = (targetElementIdElement, targetElementIndex, targetElement, parentElementIndex, parentElement, falseCase, action, targetType, myExpectedText) => {
    var retrivedValue;
    // Check for empty text
    if (typeof myExpectedText === 'undefined' && typeof falseCase === 'undefined') {
        myExpectedText = '';
        falseCase = !falseCase;
    } else if (typeof myExpectedText === 'function') {
        myExpectedText = '';
    }

    switch (targetType) {
        case 'value':
            if (typeof(targetElementIdElement) != 'undefined' && targetElementIdElement.isExisting()) {
                if (targetElementIdElement.getTagName() == 'input') {
                    retrivedValue = targetElementIdElement.getValue();
                } else {
                    retrivedValue = browser.getElementAttribute(targetElementIdElement, targetType);
                }    
            } else {
                retrivedValue = '';
            }
            break;
        case 'text':
        case 'regex':
            retrivedValue = typeof(targetElementIdElement) != 'undefined' && targetElementIdElement.isExisting() ? targetElementIdElement.getText() : '';
    }

    if (['existing', 'displayed', 'visible', 'enabled', 'clickable', 'focused', 'selected', 'checked'].includes(action)) {
        var checkAction = `is${action.charAt(0).toUpperCase()}${action.slice(1)}`;
        if (checkAction == 'isVisible') checkAction = 'isDisplayedInViewport';
        if (checkAction == 'isChecked') checkAction = 'isSelected';
        const myResult = typeof(targetElementIdElement) != 'undefined' && targetElementIdElement.isExisting() && targetElementIdElement[checkAction]();
        expect(myResult).toBe(!falseCase, `Failed expectation: the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" is ${falseCase} ${action}`);    
    } else if (falseCase) {
        switch (action) {
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
                    RegExp(myExpectedText),
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should not match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
        }
    } else {
        switch (action) {
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
                    RegExp(myExpectedText),
                    `the ${targetElementIndex} target element "${targetElement}" inside the ${parentElementIndex} parent element "${parentElement}" should match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                expect(false).toEqual(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

module.exports = (targetElementIndex, targetElement, parentElementIndex, parentElement, containsTheText, falseCase, action, targetType, expectedText) => {
    const myExpectedText = parseExpectedText(expectedText);
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const myContainsTheText = parseExpectedText(containsTheText) || '';
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : (parentElement) ? 0 : -1;  // -1 indicates no parent element

    var targetElementIdElement;
    if (myParentElement) {
        $(myParentElement).waitForExist();
        const myFilteredParentElement = $$(myParentElement).filter(elem => elem.getText().includes(myContainsTheText));
        if (parentElementIndexInt >= 0) {
            targetElementIdElement = myFilteredParentElement[parentElementIndexInt].$$(myTargetElement)[targetElementIndexInt];
            checkElement(targetElementIdElement, targetElementIndex, myTargetElement, parentElementIndex, myParentElement, falseCase, action, targetType, myExpectedText);
        } else {
            myFilteredParentElement.forEach((pElement, pIndex) => {
                targetElementIdElement = $$(pElement.selector)[pIndex].$$(myTargetElement)[targetElementIndexInt];
                checkElement(targetElementIdElement, targetElementIndex, myTargetElement, pIndex + 1, myParentElement, falseCase, action, targetType, myExpectedText);    
            });
        }
    } else {
        targetElementIdElement = $$(myTargetElement)[targetElementIndexInt];
        checkElement(targetElementIdElement, targetElementIndex, myTargetElement, parentElementIndex, myParentElement, falseCase, action, targetType, myExpectedText);
    }
};

