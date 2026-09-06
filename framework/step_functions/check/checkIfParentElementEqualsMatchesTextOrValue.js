/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  nthTarget          The nth element that contains the target, start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  childElement       child element selector
 * @param  {Boolean} falseCase          Check if the element (does not) exists
 * @param  {String}  action             is, equals, contains or matches
 * @param  {String}  targetType         text or value
 * @param  {String}  expectedText       The text to validate against
 */

const { debug } = require('request/request');
const parseExpectedText = require('../common/parseExpectedText');

const checkElement = async (parentElement, childElement, falseCase, action, targetType, myExpectedText) => {
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
            if (typeof(parentElement) != 'undefined' && await parentElement.isExisting()) {
                if ((await parentElement.getTagName()) == 'input') {
                    retrivedValue = await parentElement.getValue();
                } else {
                    retrivedValue = await browser.getElementAttribute(parentElement, targetType);
                }    
            } else {
                retrivedValue = '';
            }
            break;
        case 'text':
        case 'regex':
            retrivedValue = typeof(parentElement) != 'undefined' && await parentElement.isExisting() ? await parentElement.getText() : '';
    }

    if (['existing', 'displayed', 'visible', 'enabled', 'clickable', 'focused', 'selected', 'checked'].includes(action)) {
        var checkAction = `is${action.charAt(0).toUpperCase()}${action.slice(1)}`;
        // "is visible" = CSS-visible (isDisplayed), not in-viewport
        if (checkAction == 'isVisible') checkAction = 'isDisplayed';
        if (checkAction == 'isChecked') checkAction = 'isSelected';
        const myResult = typeof(parentElement) != 'undefined' && await parentElement.isExisting() && await parentElement[checkAction]();
        await expect(myResult).toBe(!falseCase, `Failed expectation: the parent element "${parentElement}" that contains the childelement "${childElement}" is ${falseCase} ${action}`);    
    } else if (falseCase) {
        switch (action) {
            case 'contain':
            case 'contains':
                await expect(retrivedValue).not.toContain(
                    myExpectedText,
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should not contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                await expect(retrivedValue).not.toEqual(
                    myExpectedText,
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should not equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                await expect(retrivedValue).not.toMatch(
                    RegExp(myExpectedText),
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should not match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
        }
    } else {
        switch (action) {
            case 'contain':
            case 'contains':
                await expect(retrivedValue).toContain(
                    myExpectedText,
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should contain ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'equal':
            case 'equals':
                await expect(retrivedValue).toEqual(
                    myExpectedText,
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should equal ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            case 'match':
            case 'matches':
                await expect(retrivedValue).toMatch(
                    RegExp(myExpectedText),
                    `the parent element "${parentElement}" that contains the childelement "${childElement}" should match ${targetType} ` +
                    `"${myExpectedText}"`
                );        
                break;
            default:
                await expect(false).toEqual(true, `action ${action} should be one of contains, equals or matches`);
        }
    }
}

const findElement = async (nthTarget, parentElement, childElement, falseCase, action, targetType, myExpectedText) => {
    const myElementIndex = parseInt(nthTarget) || 1;
    const elementList = await $$(parentElement);
    var findResult;
    for (i=0; i<elementList.length; i++) {
        if (await (await elementList[i].$(childElement)).isExisting()) {
            if (myElementIndex <= 1) {
                findResult = elementList[i];
                break;
            } else {
                myElementIndex--;
            }
        }
    }    
    return findResult;
}

module.exports = async (nthTarget, parentElement, childElement, falseCase, action, targetType, myExpectedText) => {
    const targetParentElement = await findElement(nthTarget, parentElement, childElement, falseCase, action, targetType, myExpectedText);
    await checkElement(targetParentElement, childElement, falseCase, action, targetType, myExpectedText);
};

