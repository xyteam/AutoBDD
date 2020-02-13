const screen_session = require('../../libs/screen_session');
module.exports = (text) => {
    screen_session.typeString(text);
};
