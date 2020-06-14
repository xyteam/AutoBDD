const FrameworkPath = process.env.FrameworkPath;
require(FrameworkPath + '/framework/support/env.js');
// if SSHPORT is defined it indicates a remote target, We will establish SSH tunnel
if ((process.env.SSHPORT) && (process.env.SSHHOST == '10.0.2.2')) {
  // the startSshTunnel() function will prevent double running
  require(FrameworkPath + '/framework/libs/framework_libs').startSshTunnel();
}

if (process.env.LOCALSELPORT) {
  module.exports = require(FrameworkPath + "/framework/configs/abdd_local.js");
} else {
  switch (process.env.PLATFORM) {
    case "Win10":
    case "Win7":
      switch (process.env.BROWSER) {
        case "IE":
          module.exports = require(FrameworkPath + "/framework/configs/abdd_Win10_IE.js");
        break;
        case "EDGE":
          module.exports = require(FrameworkPath + "/framework/configs/abdd_Win10_EDGE.js");
        break;
        case "CH":
          module.exports = require(FrameworkPath + "/framework/configs/abdd_Win10_CH.js");
        break;
      }
      break;
    case "Linux":
      switch(process.env.BROWSER) {
        case "CH":
          module.exports = require(FrameworkPath + "/framework/configs/abdd_Linux_CH.js");
        break;
        case "FF":
          module.exports = require(FrameworkPath + "/framework/configs/abdd_Linux_FF.js");
        break;
      }
    break;
    default:
      module.exports = require(FrameworkPath + "/framework/configs/abdd_Linux_CH.js");
    break;
  }
}
