const browserAction = require("./browserAction");

/**
 * Handle a modal
 * @param  {String}   action    Action to perform on the modal (accept, dismiss)
 * @param  {String}   modalType Type of modal (alertbox, confirmbox, prompt)
 */
const screen_session = require('../../libs/screen_session');
module.exports = (action, modalType) => {
    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command = `${action}Alert`;

    // /**
    //  * Alert boxes can't be dismissed, this causes Chrome to crash during tests
    //  */
    // if (modalType === 'alertbox') {
    //     command = 'acceptAlert';
    // }
    // if screen_session typeString is used we need to hit "enter" to accept alert
    console.log(`"${command}" and ${process.env.alert_use_screen_session_typestring}`);
    if (command == 'acceptAlert' && process.env.alert_use_screen_session_typestring) {
        screen_session.keyTap();
    }
    else {
        browserAction(command);
    }
};
