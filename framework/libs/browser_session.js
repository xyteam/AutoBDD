// browser_session.js provides additional functions to see and control the browser

const screen_session = require('./screen_session');
const encodeUrl = require('encodeurl');
const defaultTimeout = 15*1000;

module.exports = {
  resetAll: function(session) {
    this.resetSession(session);
    this.resetSize(session);
  },

  resetSession: function(session) {
    session.reload();
  },

  resetSize: function(session) {
    try {
      session.windowHandleMaximize();
    } catch(e) {};
  },

  openUrl: function(session, url) {
    var handle = setInterval(function() {
      session.refresh();
    }, defaultTimeout);
    session.url(url);
    clearInterval(handle);
  },

  openUrlInNewTab: function(session, url) {
    var handle = setInterval(function() {
      session.refresh();
    }, defaultTimeout);
    session.newWindow(url);
    session.pause(1000);
    if (process.env.BROWSER == 'IE') {
      screen_session.clickImage(null, 'IE_AllowOnce.png');
      session.pause(3000);
      screen_session.clickImage(null, 'IE_DismissX.png');
    }
    session.pause(1000);
    clearInterval(handle);
  },
  
  clickAndEnter: function(session, linkToClick) {
    session.waitForExist(linkToClick, 15000);
    try {
      session.click(linkToClick)
      try {
        session.pause(1000);
      } catch(e) {}
    } catch(e) {}
    screen_session.keyTap('enter');
  },

  displayMessage: function(session, displayMsg) {
    session.url('data:text/plain;charset=utf-8,' + encodeUrl(displayMsg, {charset: 'utf-8'}));
    session.pause(1000);
  },

  showErrorLog: function(session) {
    var anyRegexWords = 'failed|rejected|unhandled|unauthorized|error|invalid';
    var msgRegex = RegExp(anyRegexWords);
    var targetLogArray = session.getLogs('browser').filter(log => msgRegex.test(log.message.toLowerCase()) === true);
    process.env.LastBrowserLog = JSON.stringify(targetLogArray);
    console.log(process.env.LastBrowserLog);
  },
  
  // wait until DOM content is loaded or timeout
  waitDOMContentLoaded: function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    session.windowHandle().addEventListener('DOMContentLoaded', (event) => {
      return;
    });
    session.pause(timeout)
    return;
  },

  // wait until Image content is loaded or timeout
  waitImageContentLoaded: function(session, timeout) {
    var timeout = timeout || defaultTimeout;
    session.windowHandle().addEventListener('onload', (event) => {
      return;
    });
    session.pause(timeout)
    return;
  }
  
}
