const screen_session = require('../../libs/screen_session');
const parseExpectedText = require('../common/parseExpectedText');

module.exports = (text) => {
    var parsedText = parseExpectedText(text);
    screen_session.typeString(parsedText);
};
