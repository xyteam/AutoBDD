/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   elem                     Element selector
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseCase               Check for opposite state
 * @param  {String}   state                    State to check for (default
 *                                             existence)
 */
const waitForContent = async (element, ms, getWhat, falseCase) => {
    try {
        // getText, getValue 
        const myElement = await $(element);
        return await browser.waitUntil(
            async () => ((await myElement[getWhat]()).length > 0) == !falseCase,
            {
                timeout: ms,
                timeoutMsg: `wait for ${getWhat} timeout`
            }
        );
    } catch(e) {
        return false;
    }
}
const waitForCondition = async (element, ms, isWhat, falseCase, element2) => {
    // isClickable, isDisplayed, isDisplayedInViewPort, isEnabled, isExisting, isFocused, isSelected,
    // isEqual(with element2)
    try {
        const myElement = await $(element);
        return await browser.waitUntil(
            async () => (await myElement[isWhat](element2)) == !falseCase,
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
async (elem, ms, falseCase, state) => {
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
        await (await browser.$(myElem))[command](intMs, !!falseCase);
    } else if (['getText', 'getValue'].includes(myState)) {
        await waitForContent(myElem, intMs, myState, !!falseCase);
    } else {
        await waitForCondition(myElem, intMs, myState, !!falseCase);
    }
};
