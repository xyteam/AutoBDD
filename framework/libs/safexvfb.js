const fs = require('fs');
const {flockSync} = require('fs-ext');
const exec = require('child_process').exec;

// allow settings to be updated via environment
const xvfb_lockdir  = `${process.env.HOME}/.xvfb-locks`;
const xvfb_display_min  = 99;
const xvfb_display_max  = 599;

module.exports = {
  start: function() {
    // assuming only one user will use this, let's put the locks in our own home directory
    // avoids vulnerability to symlink attacks.
    if (!fs.existsSync(`${xvfb_lockdir}`)) fs.mkdirSync(`${xvfb_lockdir}`);
    var displayNum = xvfb_display_min;
    while ( displayNum < xvfb_display_max ) {
      if (fs.existsSync(`/tmp/.X${displayNum}-lock`)) {
        displayNum += 1;
        continue;
      }
      const fd = fs.openSync(`${xvfb_lockdir}/${displayNum}`, 'w');
      try {
        flockSync(fd, 'exnb');
        exec(`/usr/bin/Xvfb :${displayNum} -screen 0 ${process.env.DISPLAYSIZE}x24 &`);
      } catch (e) {
        displayNum += 1;
        continue;
      }
      return displayNum;
    }
  },

  stop: function(displayNum) {
    exec(`pkill -f "/usr/bin/Xvfb :${displayNum}"`);
    const fd = fs.openSync(`${xvfb_lockdir}/${displayNum}`, 'r');
    fcntlSync(fd, 'un');
  },
};