const myFrameworkPath = process.env.FrameworkPath;
require(myFrameworkPath + '/global/support/env.js');

if (process.env.LOCALSELPORT) {
  module.exports = require(myFrameworkPath + "/global/configs/chimp_local.js");
} else {
  switch (process.env.PLATFORM) {
    case "Win10":
    case "Win7":
      switch (process.env.BROWSER) {
        case "IE":
          module.exports = require(myFrameworkPath + "/global/configs/chimp_Win10_IE.js");
        break;
        case "EDGE":
          module.exports = require(myFrameworkPath + "/global/configs/chimp_Win10_EDGE.js");
        break;
        case "CH":
          module.exports = require(myFrameworkPath + "/global/configs/chimp_Win10_CH.js");
        break;
      }
      break;
    case "Linux":
      switch(process.env.BROWSER) {
        case "CH":
          module.exports = require(myFrameworkPath + "/global/configs/chimp_Linux_CH.js");
        break;
      }
    break;
    default:
      module.exports = require(myFrameworkPath + "/global/configs/chimp_Linux_CH.js");
    break;
  }
}
