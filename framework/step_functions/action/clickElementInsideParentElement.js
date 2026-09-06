/**
 * Perform an click action on the given element
 * @param  {String}  action             The action to perform on the target elementID
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 * @param  {String}  containsTheText    containing text that identifies the parent element
 * @param  {String}  ifExists           if exists
 */

const parseExpectedText = require('../common/parseExpectedText');
module.exports = async (action, targetElementIndex, targetElement, parentElementIndex, parentElement, containsTheText, ifExists) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const myContainsTheText = parseExpectedText(containsTheText) || '';
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    const deepClick = function(argument) { $(argument).click() };

    const clickAction = async () => {
        var targetElementIdElement;
        if (parentElement) {
            await (await $(myParentElement)).waitForExist();
            const myParentElementList = await $$(myParentElement);
            const myFilteredParentElement = [];
            for (const elem of myParentElementList) {
                if ((await elem.getText()).includes(myContainsTheText)) {
                    myFilteredParentElement.push(elem);
                }
            }
            const targetParentElement = (parentElementIndex == 'last') ? myFilteredParentElement.slice(-1) : myFilteredParentElement[parentElementIndexInt];
            targetElementIdElement = (targetElementIndex == 'last') ? (await targetParentElement.$$(myTargetElement)).slice(-1) : (await targetParentElement.$$(myTargetElement))[targetElementIndexInt];
        } else {
            targetElementIdElement = (targetElementIndex == 'last') ? (await $$(myTargetElement)).slice(-1) : (await $$(myTargetElement))[targetElementIndexInt];
        }
        // console.log(myTargetElement);
    
        switch (action) {
            case 'moveTo':
                await (await browser.$(targetElementIdElement)).moveTo();
                break;
            case 'clear':
                await (await browser.$(targetElementIdElement)).clearValue();
                break;
            case 'tryClick':
                try {
                    console.log('1st try with direct click ...')
                    await (await browser.$(targetElementIdElement)).click();
                } catch (e) {
                    console.log('2nd try with deep click ...')
                    await browser.execute(deepClick, targetElementIdElement);          
                }
                break;
            case 'deepClick':
                    console.log('do deep click ...')
                    await browser.execute(deepClick, targetElementIdElement);          
                    break;
            case 'click':
            default:
                await (await browser.$(targetElementIdElement)).click();
                break;
        }    
    }

    if (ifExists) {
        try {
            await clickAction();
        } catch (e) {
            console.log(`try: element ${targetElement} does not exist`);
        }
    } else {
        await clickAction();
    }
};
