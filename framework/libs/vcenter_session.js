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
    loginVcenter: async function(session, vCenterURL) {
        const [vCenterHost, vCenterUser, vCenterPass] = this.getVcenterInfo(vCenterURL);
        await session.url(`https://${vCenterHost}/ui/`);
        await session.pause(500);
        await browser_session.bypassChromeWarningIfEncounter(session);
        try {
            await (await session.$('#username')).waitForExist(3000);
            await (await session.$('#username')).setValue(vCenterUser);
            await (await session.$('#password')).setValue(vCenterPass);
            await (await session.$('#submit')).click();
        } catch(e) {}
        try {
            await (await session.$('.settings')).waitForDisplayed(5*1000);
            return true;
        } catch(e) {
            return false;
        }
    },

    // define logout function
    logoutVcenter: async function(session, vCenterURL) {
        const [vCenterHost, vCenterUser, vCenterPass] = this.getVcenterInfo(vCenterURL);
        await session.url(`https://${vCenterHost}/ui/`);
        await session.pause(500);
        await browser_session.bypassChromeWarningIfEncounter(session);
        try {
            await (await session.$('.nav-icon.user-menu-large')).waitForExist(3000);
            await (await session.$('.nav-icon.user-menu-large')).click();
            await (await session.$('a=Logout')).click();
        } catch(e) {}
        try {
            await (await session.$('#password')).waitForDisplayed(5*1000);
            return true;
        } catch(e) {
            return false;
        }
    },

    reLoginVcenter: async function(session, vCenterURL) {
        await this.logoutVcenter(session, vCenterURL);
        return await this.loginVcenter(session, vCenterURL);
    },
}
