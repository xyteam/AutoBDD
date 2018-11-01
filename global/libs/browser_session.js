const robot_session = require('./robot_session');

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
    }, 15*1000);
    session.url(url);
    clearInterval(handle);
  },

  openUrlInNewTab: function(session, url) {
    var handle = setInterval(function() {
      session.refresh();
    }, 15*1000);
    session.newWindow(url);
    session.pause(1000);
    if (process.env.BROWSER == 'IE') {
      robot_session.clickImage(null, 'IE_AllowOnce.png');
      session.pause(3000);
      robot_session.clickImage(null, 'IE_DismissX.png');
    }
    session.pause(1000);
    clearInterval(handle);
  }
}
