/**
 * Perform an click action on the given element
 * @param  {String}  action             The action to perform on the target elementID
 * @param  {String}  elementIndex       The nth element start from 1st,2nd,3rd,4th
 * @param  {String}  element            Element selector
 * @param  {String}  parentElementIndex The nth parent element start from 1st,2nd,3rd,4th
 * @param  {String}  parentElement      Element selector
 */
module.exports = (action, elementIndex, element, parentElementIndex, parentElement) => {
    /**
     * Element to perform the action on
     * @type {String}
     */
    var targetElementID;
    const elementIndexInt = (elementIndex) ? parseInt(elementIndex) - 1 : 0;
    const parentElementIndexInt = (parentElementIndex) ? parseInt(parentElementIndex) - 1 : 0;
    if (parentElement) {
        const parentElementId = browser.elements(parentElement).value[parentElementIndexInt].ELEMENT;
        targetElementID = browser.elementIdElements(parentElementId, element).value[elementIndexInt].ELEMENT;
    } else {
        targetElementID = browser.elements(element).value[elementIndexInt].ELEMENT;
    }
    /**
     * The method to call on the browser object
     * @type {String}
     */
    var method;
    switch (action) {
        case 'clear':
            method = 'elementIdClear';
        case 'click':
        default:
            method = 'elementIdClick';
    }
    browser[method](targetElementID);
};
