const checkIfElementExists = require('../check/checkIfElementExists');
const isVisible = require('../check/isVisible');
/**
 * Perform an click action on the given element
 * @param  {String}   action  The action to perform (click or doubleClick)
 * @param  {String}   type    Type of the element (link or selector)
 * @param  {String}   element Element selector
 */
module.exports = (action, type, element) => {
    /**
     * Element to perform the action on
     * @type {String}
     */
  
    var targetElement;
    switch (type) {
        case 'element':
            targetElement = element;
            break;
        case 'link':
            targetElement = `a=${element}`;
            break;
        default:
            targetElement = `${type}=${element}`
    }

    const webElementChars = ['#', '.', '[', '/'];
    webElementChars.forEach((char) => {
        if (element.startsWith(char)) targetElement = element;
    })

    /**
     * The method to call on the browser object
     * @type {String}
     */
    var method;
    switch (action) {
        case 'hover':
            method = 'moveTo';
            break;
        case 'double click':
            method = 'doubleClick';
            break;
        case 'left click':
            method = 'leftClick';
            break;
        case 'middle click':
            method = 'middleClick';
            break;
        case 'right click':
            method = 'rightClick';
            break;
        case 'click':
            method = 'click';
            break;
        default:
            method = action;
    }
    checkIfElementExists(targetElement);
    browser.scroll(targetElement, 0, -200);
    isVisible('some', targetElement, 'becomes');
    browser[method](targetElement);
};
