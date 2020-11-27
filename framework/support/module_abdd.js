// derive running env-vars
const path = require('path');
process.env.PROJECTBASE = process.env.PROJECTBASE || 'test-projects';
process.env.ABDD_PROJECT = process.env.ABDD_PROJECT || path.resolve().split(process.env.PROJECTBASE)[1].split('/')[1]
process.env.PROJECTRUNPATH = path.resolve().split(process.env.ABDD_PROJECT)[0] + process.env.ABDD_PROJECT
process.env.TestDir = path.resolve().split(process.env.ABDD_PROJECT)[1].split('/')[1];
process.env.TestModule = path.resolve().split(process.env.ABDD_PROJECT)[1].split('/')[2];
// require module - project - framework env-vars
require('./support/env.js');
require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/env.js`);
if (process.env.FrameworkPath) require(process.env.FrameworkPath + '/framework/support/env.js');
var moduleAbdd = require(`${process.env.PROJECTRUNPATH}/${process.env.TestDir}/support/abdd.js`);
// add or modify abdd config attributes as necessary
// consol.log(moduleAbdd.config);
// moduleAbdd.config.baseUrl = process.env.WEB_URL;
module.exports = moduleAbdd;
