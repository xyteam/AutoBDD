/**
 * Perform an click action on the given element
 * @param  {String}  action             The action to perform on the target elementID
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 */

const parseExpectedText = require('../common/parseExpectedText');
module.exports = (action, targetElementIndex, targetElement, parentElementIndex, parentElement) => {
    const myTargetElement = parseExpectedText(targetElement);
    const myParentElement = parseExpectedText(parentElement);
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    const deepClick = function(argument) { $(argument).click() };

    var targetElementIdElement;
    if (parentElement) {
        $(myParentElement).waitForExist();
        targetElementIdElement = browser.$$(myParentElement)[parentElementIndexInt].$$(myTargetElement)[targetElementIndexInt];
    } else {
        targetElementIdElement = browser.$$(myTargetElement)[targetElementIndexInt];
    }
    // console.log(myTargetElement);

    switch (action) {
        case 'moveTo':
            browser.$(targetElementIdElement).moveTo();
            break;
        case 'clear':
            browser.$(targetElementIdElement).clearValue();
            break;
        case 'tryClick':
            try {
                console.log('1st try with direct click ...')
                browser.$(targetElementIdElement).click();
            } catch (e) {
                console.log('2nd try with deep click ...')
                browser.execute(deepClick, targetElementIdElement);          
            }
            break;
        case 'deepClick':
                console.log('do deep click ...')
                browser.execute(deepClick, targetElementIdElement);          
                break;
        case 'click':
        default:
            browser.$(targetElementIdElement).click();
            break;
    }
};

