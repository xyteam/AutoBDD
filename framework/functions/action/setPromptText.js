/**
 * Set the text of the current prompt
 * @param  {String}   modalText The text to set to the prompt
 */
const screen_session = require('../../libs/screen_session');
const assert = require('assert');
module.exports = (modalText) => {
    try {
        // browser.sendAlertText(text) does not work with HTML5,
        // use screen_session typeString(text) function instead.
        // browser.sendAlertText(modalText);
        screen_session.typeString(modalText);
        process.env.alert_use_screen_session_typestring = true;
    } catch (e) {
        assert(e, 'A prompt was not open when it should have been open');
    }
};
