const screen_session = require('../../libs/screen_session');
module.exports = (keyName, repeatTimes) => {
    for (i=0; i<repeatTimes; i++) {
        screen_session.keyTap(keyName);
    }
};
