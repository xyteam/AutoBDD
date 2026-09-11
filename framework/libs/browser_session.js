// browser_session.js provides additional functions to see and control the browser

const screen_session = require('./screen_session');
const encodeUrl = require('encodeurl');
const defaultTimeout = 15*1000;

// Browser console/log capture (wdio9): browser.getLogs('browser') is removed for
// standard sessions. We capture via CDP (Chromium) on a best-effort basis; if CDP
// is unavailable the helpers degrade to an empty array and never throw.
let _consoleLogs = [];
let _consoleCaptureStarted = false;

async function startConsoleCapture(session) {
  if (_consoleCaptureStarted || !session) return;
  _consoleCaptureStarted = true;
  _consoleLogs = [];
  try {
    const cdp = session && session.cdpSession;
    if (cdp && typeof cdp.send === 'function' && typeof cdp.on === 'function') {
      await cdp.send('Log.enable').catch(() => {});
      await cdp.send('Runtime.enable').catch(() => {});
      cdp.on('Log.entryAdded', (event) => {
        try {
          const entry = event && event.entry;
          _consoleLogs.push({ message: String(entry && entry.text || ''), level: String(entry && entry.level || 'log') });
        } catch (e) {}
      });
      cdp.on('Runtime.consoleAPICalled', (event) => {
        try {
          const args = (event && event.args || []).map(a => (a && a.value != null) ? a.value : (a && a.description != null ? a.description : ''));
          _consoleLogs.push({ message: args.join(' '), level: 'console' });
        } catch (e) {}
      });
    }
  } catch (e) {
    // capture unavailable; stay a no-op
  }
}

// Return captured browser console/log entries (best-effort). Starts capture lazily.
async function getBrowserLogs(session) {
  await startConsoleCapture(session);
  return _consoleLogs;
}

module.exports = {
  // (re)start console/log capture for a fresh scenario
  startConsoleCapture: startConsoleCapture,

  // best-effort browser log array for the current capture window
  getBrowserLogs: getBrowserLogs,

  resetAll: async function(session) {
    await this.resetSession(session);
    await this.resetSize(session);
  },

  resetSession: async function(session) {
    await session.reload();
  },

  resetSize: async function(session) {
    try {
      await session.maximizeWindow();
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
    await (await session.$(linkToClick)).waitForExist({ timeout: 15000 });
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
    var targetLogArray = await this.getBrowserLogs(session);
    targetLogArray = targetLogArray.filter(log => msgRegex.test(String(log.message).toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
  },

  // wait until DOM content is loaded or timeout
  waitDOMContentLoaded: async function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    await session.pause(timeout)
    return;
  },

  // wait until Image content is loaded or timeout
  waitImageContentLoaded: async function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    await session.pause(timeout)
    return;
  },

  // define bypass chrome warning function
  bypassChromeWarningIfEncounter: async function(session) {
    try {
      if (await (await session.$('button=Advanced')).waitForExist({ timeout: 3000 })) {
        await (await session.$('button=Advanced')).click();
        await (await session.$('a*=Proceed to')).click();
        return true;
      }
    } catch(e) {
      return false;
    }
  },

}
