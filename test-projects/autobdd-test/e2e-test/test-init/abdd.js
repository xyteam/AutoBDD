require('./support/env.js');
var moduleAbdd = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/abdd.js`);
// modify or add myAbdd attributes as necessary
moduleAbdd.config.services[0][1].skipSeleniumInstall = false;
module.exports = moduleAbdd;