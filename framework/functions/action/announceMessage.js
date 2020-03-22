/**
 * make announcement and console log message
 * @param  {String}   element Element selector
 */
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const parseExpectedText = require(FrameworkPath + '/framework/functions/common/parseExpectedText');
module.exports = (target, message) => {
    const myMessage = parseExpectedText(message);
    switch (target) {
        case 'browser':
            browser_session.displayMessage(browser, myMessage);
            break;
    }
    // always announce at console
    console.log(myMessage);
};
