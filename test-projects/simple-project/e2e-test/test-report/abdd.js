require('./support/env.js')
var moduleAbdd = require(process.env.PROJECTRUNPATH + '/e2e-test/support/abdd.js');
// online mode is needed for test-init to download drivers
moduleAbdd.offline = true;
// modify or add myAbdd attributes as necessary

module.exports = moduleAbdd; 
