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

module.exports = async (targetElementIndex, targetElement, parentElementIndex, parentElement, ms, falseCase, state) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : -1; // -1 indicates no parent element
    const intMs = parseInt(ms, 10) || 3000;
    const existOption = {timeout: intMs, reverse: !!falseCase};

    var targetElementIdElement;
    if (myParentElement) {
        await (await $(myParentElement)).waitForExist();
        const parentElementList = await $$(myParentElement);
        if (parentElementIndexInt >= 0) {
            const parentElementInstance = parentElementList[parentElementIndexInt];
            await (await parentElementInstance.$(myTargetElement)).waitForExist(existOption);
            try {
                targetElementIdElement = (await parentElementInstance.$$(myTargetElement))[targetElementIndexInt];
            } catch(e) { /* no-op */ }
            if (targetElementIdElement) await waitForCondition(targetElementIdElement, intMs, !!falseCase, state);
        } else {
            for (const [pIndex, pElement] of parentElementList.entries()) {
                await (await (await $$(pElement.selector))[pIndex].$(myTargetElement)).waitForExist(existOption);
                try {
                    targetElementIdElement = (await (await $$(pElement.selector))[pIndex].$$(myTargetElement))[targetElementIndexInt];
                } catch(e) { /* no-op */ }
                if (targetElementIdElement) await waitForCondition(targetElementIdElement, intMs, !!falseCase, state);    
            }
        }
    } else {
        try {
            await (await $(myTargetElement)).waitForExist(existOption);
        } catch(e) { /* no-op */ }
        targetElementIdElement = (await $$(myTargetElement))[targetElementIndexInt];
        if (targetElementIdElement) await waitForCondition(targetElementIdElement, intMs, !!falseCase, state);
    }
    await browser.pause(500);
};
