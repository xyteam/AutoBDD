const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
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
