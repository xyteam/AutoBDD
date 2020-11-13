const screen_session = require('../../libs/screen_session');
module.exports = (action, keyName, repeatTimes) => {
    const myRepeatTimes = repeatTimes || 1;
    const [myKeyModifier, myKeyName] = (keyName.includes('-')) ? keyName.split('-') : [null, keyName];
    for (i=0; i<myRepeatTimes; i++) {
        switch (action) {
            case 'press':
                screen_session.keyTap(myKeyName, myKeyModifier);
                break;
            case 'toggle up':
                screen_session.keyToggle(myKeyName, 'up', myKeyModifier);
                break;
            case 'toggle down':
                screen_session.keyToggle(myKeyName, 'down', myKeyModifier);
                break;           
        }
    }
};
