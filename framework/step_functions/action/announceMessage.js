const browser_session = require('../../libs/browser_session');
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (target, message) => {
    const myMessage = parseExpectedText(message);
    if (target) {
        switch (target) {
            case 'browser':
                browser_session.displayMessage(browser, myMessage);
                break;
        }    
    }
    // always announce at console
    console.log(myMessage);
};
