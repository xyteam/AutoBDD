const checkIfElementExists = require('../common/checkIfElementExists');
const waitForVisible = require('../action/waitForVisible');

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
    const targetElement = (type === 'element') ? element : `${type}=${element}`;

    /**
     * The method to call on the browser object
     * @type {String}
     */
    var method;
    switch (action) {
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
        default:
            method = 'click';
    }
    checkIfElementExists(targetElement);
    browser.scroll(targetElement, 0, -200);
    waitForVisible(targetElement);
    browser[method](targetElement);
};
