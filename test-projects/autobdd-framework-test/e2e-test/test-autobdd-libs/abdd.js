const path = require('path');
// require framework level env vars
require(process.env.FrameworkPath + '/framework/support/env.js');
process.env.TestDir = path.resolve(__dirname).split(process.env.PROJECTNAME)[1].split('/')[1];
process.env.TestModule = path.resolve(__dirname).split(process.env.PROJECTNAME)[1].split('/')[2];
// require project level env vars
require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/env.js`);
// require module level env vars
require(path.resolve(__dirname) + '/support/env.js');
var moduleAbdd = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/abdd.js`);
// console.log(moduleAbdd);
// modify or add abdd attributes as necessary
moduleAbdd.baseUrl = 'chrome://version';
module.exports = moduleAbdd;