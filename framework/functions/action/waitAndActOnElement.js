const checkIfElementExists = require('../check/checkIfElementExists');
const isVisible = require('../check/isVisible');
const waitFor = require('../action/waitFor');

/**
 * Perform an click action on the given element
 * @param  {String}   waitMs  wait time in ms
 * @param  {String}   action  The action to perform (click or doubleClick)
 * @param  {String}   type    Type of the element (link or selector)
 * @param  {String}   element Element selector
 */
module.exports = (waitMs, action, type, element) => {
    const myWaitMS = parseInt(waitMs, 10) || 3000;
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
    if (method.toLowerCase().includes('click')) {
        waitFor(targetElement, myWaitMS, null, 'enabled');
    }
    browser.scroll(targetElement, 0, -200);
    isVisible('some', targetElement, 'becomes');
    browser[method](targetElement);
};
