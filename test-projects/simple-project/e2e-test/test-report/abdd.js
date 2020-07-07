require('./support/env.js');
var moduleAbdd = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/abdd.js`);
// online mode is needed for test-init to download drivers
moduleAbdd.offline = false;
// modify or add myAbdd attributes as necessary
module.exports = moduleAbdd;
