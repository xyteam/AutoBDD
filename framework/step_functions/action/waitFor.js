/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   elem                     Element selector
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseCase               Check for opposite state
 * @param  {String}   state                    State to check for (default
 *                                             existence)
 */
const waitForContent = (element, ms, getWhat, falseCase) => {
    try {
        // getText, getValue 
        return browser.waitUntil(
            () => ($(element)[getWhat]().length > 0) == !falseCase,
            {
                timeout: ms,
                timeoutMsg: `wait for ${getWhat} timeout`
            }
        );
    } catch(e) {
        return false;
    }
}
const waitForCondition = (element, ms, isWhat, falseCase, element2) => {
    // isClickable, isDisplayed, isDisplayedInViewPort, isEnabled, isExisting, isFocused, isSelected,
    // isEqual(with element2)
    try {
        return browser.waitUntil(
            () => ($(element)[isWhat](element2)) == !falseCase,
            {
                timeout: ms,
                timeoutMsg: `wait for ${isWhat} timeout`
            }
        );    
    } catch (e) {
        return false;
    }
}

const parseExpectedText = require('../common/parseExpectedText');

module.exports =
(elem, ms, falseCase, state) => {
    /**
     * Parsed element selector
     * @type {String}
     */
    const myElem = parseExpectedText(elem);
    
    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {Int}
     */
    const intMs = parseInt(ms, 10) || 3000;

    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {String}
     */
    var myState = state || 'exist';
    // convert conditions
    if (myState == 'be visible') myState = 'be displayed';
    if (myState == 'be selected') myState = 'isSelected';
    if (myState == 'be checked') myState = 'isSelected';
    if (myState == 'contain a text') myState = 'getText';
    if (myState == 'contain a value') myState = 'getValue';

    if (['exist', 'be enabled', 'be displayed', 'be clickable'].includes(myState)) {
        // ready to call conditions;
        var parsedState = myState.replace('be ', '');
        parsedState = parsedState.charAt(0).toUpperCase() + parsedState.slice(1);
        const command = `waitFor${parsedState}`;
        browser.$(myElem)[command](intMs, !!falseCase);
    } else if (['getText', 'getValue'].includes(myState)) {
        waitForContent(myElem, intMs, myState, !!falseCase);
    } else {
        waitForCondition(myElem, intMs, myState, !!falseCase);
    }
};
