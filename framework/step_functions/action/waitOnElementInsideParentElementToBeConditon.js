/**
 * Check if the given element inside a given parent element has expected text or value
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  ms                       Wait duration (optional)
 * @param  {String}  falseCase                Check for opposite state
 * @param  {String}  state                    State to check for (default existence)
 */

const parseExpectedText = require('../common/parseExpectedText');
const waitForCondition = require('./waitForCondition');

module.exports = (targetElementIndex, targetElement, parentElementIndex, parentElement, ms, falseCase, state) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : -1; // -1 indicates no parent element
    const intMs = parseInt(ms, 10) || 3000;
    const existOption = {timeout: intMs, reverse: !!falseCase};

    var targetElementIdElement;
    if (myParentElement) {
        $(myParentElement).waitForExist();
        if (parentElementIndexInt >= 0) {
            $$(myParentElement)[parentElementIndexInt].$(myTargetElement).waitForExist(existOption);
            try {
                targetElementIdElement = $$(myParentElement)[parentElementIndexInt].$$(myTargetElement)[targetElementIndexInt];
            } catch(e) { /* no-op */ }
            if (targetElementIdElement) waitForCondition(targetElementIdElement, intMs, !!falseCase, state);
        } else {
            $$(myParentElement).forEach((pElement, pIndex) => {
                $$(pElement.selector)[pIndex].$(myTargetElement).waitForExist(existOption);
                try {
                    targetElementIdElement = $$(pElement.selector)[pIndex].$$(myTargetElement)[targetElementIndexInt];
                } catch(e) { /* no-op */ }
                if (targetElementIdElement) waitForCondition(targetElementIdElement, intMs, !!falseCase, state);    
            });
        }
    } else {
        try {
            $(myTargetElement).waitForExist(existOption);
        } catch(e) { /* no-op */ }
        targetElementIdElement = $$(myTargetElement)[targetElementIndexInt];
        if (targetElementIdElement) waitForCondition(targetElementIdElement, intMs, !!falseCase, state);
    }
    browser.pause(500);
};

