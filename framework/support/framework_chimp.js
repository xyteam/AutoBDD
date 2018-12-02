const frameworkPath = process.env.FrameworkPath;
require(frameworkPath + '/framework/support/framework_env.js');

// if SSHPORT is defined it indicates a remote target, We will establish SSH tunnel
if ((process.env.SSHPORT) && (process.env.SSHHOST == '10.0.2.2')) {
  require(frameworkPath + '/framework/libs/framework_libs').startSshTunnel();
}

if (process.env.LOCALSELPORT) {
  module.exports = require(frameworkPath + "/framework/configs/chimp_local.js");
} else {
  switch (process.env.PLATFORM) {
    case "Win10":
    case "Win7":
      switch (process.env.BROWSER) {
        case "IE":
          module.exports = require(frameworkPath + "/framework/configs/chimp_Win10_IE.js");
        break;
        case "EDGE":
          module.exports = require(frameworkPath + "/framework/configs/chimp_Win10_EDGE.js");
        break;
        case "CH":
          module.exports = require(frameworkPath + "/framework/configs/chimp_Win10_CH.js");
        break;
      }
      break;
    case "Linux":
      switch(process.env.BROWSER) {
        case "CH":
          module.exports = require(frameworkPath + "/framework/configs/chimp_Linux_CH.js");
        break;
      }
    break;
    default:
      module.exports = require(frameworkPath + "/framework/configs/chimp_Linux_CH.js");
    break;
  }
}
