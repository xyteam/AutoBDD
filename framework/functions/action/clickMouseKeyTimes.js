const screen_session = require('../../libs/screen_session');
module.exports = (double, keyName, repeatTimes) => {
    const myRepeatTimes = repeatTimes || 1;
    const [myKeyModifier, myKeyName] = (keyName.includes('-')) ? keyName.split('-') : [null, keyName];
    for (i=0; i<myRepeatTimes; i++) {
        screen_session.mouseClick(myKeyName, !!double);
    }
};
