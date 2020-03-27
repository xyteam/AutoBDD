require('./support/env.js')
var moduleChimp = require(process.env.PROJECTRUNPATH + '/project/support/chimp.js');
// online mode is needed for test-init to download drivers
moduleChimp.offline = true;
// modify or add myChimp attributes as necessary

module.exports = moduleChimp; 