const checkIfElementExists = require('../check/checkIfElementExists');
const checkCondition = require('../check/checkCondition');
const waitForCondition = require('../action/waitForCondition');

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
    var options = { button: 0, x: 0, y: 0};
    switch (action) {
        case 'hover':
            method = 'moveTo';
            break;
        case 'click':
        case 'left click':
            method = 'click';
            break;
        case 'middle click':
            method = 'click';
            options.button = 1;
            break;
        case 'right click':
            method = 'click';
            options.button = 2;
            break;
        default:
            method = action;
    }

    checkIfElementExists(targetElement);
    if (method.toLowerCase().includes('click')) {
        waitForCondition(targetElement, myWaitMS, null, 'clickable');
    }
    browser.$(targetElement).scrollIntoView();
    checkCondition('some', targetElement, 'becomes', null, 'visible');
    if (action == 'double click') {
        const doubleClick = function(argument) { $(argument).dblclick() };
        browser.execute(doubleClick, targetElement);
    } else {
        browser.$(targetElement)[method](options);
    }
};
