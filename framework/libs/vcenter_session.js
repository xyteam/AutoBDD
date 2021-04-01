// vcenter_session.js provides additional functions to see and control the vcenter
const browser_session = require(process.env.FrameworkPath + '/framework/libs/browser_session.js');

module.exports = {
    getVcenterInfo: function(vCenterURL) {
        const vCenterHost = vCenterURL.substring(vCenterURL.lastIndexOf('@') + 1);
        const vCenterPassPhase = vCenterURL.substring(vCenterURL.indexOf('://') + 3, vCenterURL.lastIndexOf('@')).split(':');
        const vCenterUser = vCenterPassPhase[0].replace(/["]/g, '');
        const vCenterPass = vCenterPassPhase[1].replace(/["]/g, '');
        return [vCenterHost, vCenterUser, vCenterPass];
    },

    // define login function
    loginVcenter: function(session, vCenterURL) {
        const [vCenterHost, vCenterUser, vCenterPass] = getVcenterInfo(vCenterURL);
        session.url(`https://${vCenterHost}/ui/`);
        session.pause(500); 
        browser_session.bypassChromeWarningIfEncounter(session);
        try {
            session.$('#username').waitForExist(3000);
            session.$('#username').setValue(vCenterUser);
            session.$('#password').setValue(vCenterPass);
            session.$('#submit').click();
        } catch(e) {}
        try {
            session.$('.settings').waitForDisplayed(5*1000);
            return true;
        } catch(e) {
            return false;
        }
    },

    // define logout function
    logoutVcenter: function(session, vCenterURL) {
        const [vCenterHost, vCenterUser, vCenterPass] = getVcenterInfo(vCenterURL);
        session.url(`https://${vCenterHost}/ui/`);
        session.pause(500);
        browser_session.bypassChromeWarningIfEncounter(session);
        try {
            session.$('.nav-icon.user-menu-large').waitForExist(3000);
            session.$('.nav-icon.user-menu-large').click();
            session.$('a=Logout').click();
        } catch(e) {}
        try {
            session.$('#password').waitForDisplayed(5*1000);  
            return true;
        } catch(e) {
            return false;
        }
    },

    reLoginVcenter: function(session, vCenterURL) {
        logoutVcenter(session, vCenterURL);
        return loginVcenter(session, vCenterURL);
    },
}
