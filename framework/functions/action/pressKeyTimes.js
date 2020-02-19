const screen_session = require('../../libs/screen_session');
module.exports = (keyName, repeatTimes) => {
    myRepeatTimes = repeatTimes || 1;
    for (i=0; i<myRepeatTimes; i++) {
        screen_session.keyTap(keyName);
    }
};
