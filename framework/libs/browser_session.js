// browser_session.js provides additional functions to see and control the browser

const screen_session = require('./screen_session');
const encodeUrl = require('encodeurl');
const defaultTimeout = 15*1000;

module.exports = {
  resetAll: async function(session) {
    await this.resetSession(session);
    await this.resetSize(session);
  },

  resetSession: async function(session) {
    await session.reload();
  },

  resetSize: async function(session) {
    try {
      await session.windowHandleMaximize();
    } catch(e) {};
  },

  openUrl: async function(session, url) {
    var handle = setInterval(function() {
      session.refresh();
    }, defaultTimeout);
    await session.url(url);
    clearInterval(handle);
  },

  clickAndEnter: async function(session, linkToClick) {
    await (await session.$(linkToClick)).waitForExist(15000);
    try {
      await (await session.$(linkToClick)).click();
      try {
        await session.pause(1000);
      } catch(e) {}
    } catch(e) {}
    screen_session.keyTap('enter');
  },

  displayMessage: async function(session, displayMsg) {
    await session.url('data:text/plain;charset=utf-8,' + encodeUrl(displayMsg, {charset: 'utf-8'}));
    await session.pause(1000);
  },

  showErrorLog: async function(session) {
    var anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    var msgRegex = RegExp(anyRegexWords);
    var targetLogArray = await session.getLogs('browser');
    targetLogArray = targetLogArray.filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
  },

  // wait until DOM content is loaded or timeout
  waitDOMContentLoaded: async function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    session.getWindowHandle().on('DOMContentLoaded', (event) => {
      return;
    });
    await session.pause(timeout)
    return;
  },

  // wait until Image content is loaded or timeout
  waitImageContentLoaded: async function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    session.getWindowHandle().on('onload', (event) => {
      return;
    });
    await session.pause(timeout)
    return;
  },

  // define bypass chrome warning function
  bypassChromeWarningIfEncounter: async function(session) {
    try {
      if (await (await session.$('button=Advanced')).waitForExist(3000)) {
        await (await session.$('button=Advanced')).click();
        await (await session.$('a*=Proceed to')).click();
        return true;
      }
    } catch(e) {
      return false;
    }
  },

}
