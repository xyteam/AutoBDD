/**
 * Perform an click action on the given element
 * @param  {String}  action             The action to perform on the target elementID
 * @param  {String}  targetElementIndex The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  targetElement      target element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      parent element selector
 */
module.exports = (action, targetElementIndex, targetElement, parentElementIndex, parentElement) => {
    const targetElementIndexInt = (targetElementIndex) ? parseInt(targetElementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;

    var targetElementId;
    if (parentElement) {
        const parentElementId = browser.elements(parentElement).value[parentElementIndexInt].ELEMENT;
        targetElementId = browser.elementIdElements(parentElementId, targetElement).value[targetElementIndexInt].ELEMENT;
    } else {
        targetElementId = browser.elements(targetElement).value[targetElementIndexInt].ELEMENT;
    }

    switch (action) {
        case 'deepClick':
            const runInBrowser = (element) => { element.click() };
            const elementToClickOn = browser.element(targetElementId).value;
            browser.execute(runInBrowser, elementToClickOn);      
            break;
        case 'clear':
            browser.elementIdClear(targetElementId);
            break;
        case 'click':
        default:
            browser.elementIdClick(targetElementId);
    }
};
