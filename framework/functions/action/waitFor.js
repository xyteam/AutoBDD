/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   elem                     Element selector
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseState               Check for opposite state
 * @param  {String}   state                    State to check for (default
 *                                             existence)
 */

const parseExpectedText = require('../common/parseExpectedText');

module.exports =
(elem, ms, falseState, state) => {
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
     * Command to perform on the browser object
     * @type {String}
     */
    let command = 'waitForExist';

    /**
     * Boolean interpretation of the false state
     * @type {Boolean}
     */
    let boolFalseState = !!falseState;
    if (typeof falseState === 'undefined') {
        boolFalseState = false;
    }

    /**
     * Parsed interpretation of the state
     * @type {String}
     */
    let parsedState = '';

    if (falseState || state) {
        parsedState = state.includes(' ')
            ? state.split(/\s/)[state.split(/\s/).length - 1]
            : state;

        // change parsedState in case state and command does not match
        switch (parsedState) {
            case 'checked':
                parsedState = 'selected';
                break;
        }

        if (parsedState) {
            command = `waitFor${parsedState[0].toUpperCase()}` + `${parsedState.slice(1)}`;
        }
    }
    // console.log(myElem);
    // console.log(command);
    browser[command](myElem, intMs, boolFalseState);
};
