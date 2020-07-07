const path = require('path');
const PROJECTBASE = process.env.PROJECTBASE || 'test-projects';
const PROJECTNAME = process.env.PROJECTNAME || path.resolve().split(PROJECTBASE)[1].split('/')[1];
var moduleDepth = path.resolve().split(PROJECTNAME)[1].split('/').length;
var relativePathToProject = '../'.repeat(moduleDepth);
require(relativePathToProject + 'e2e-test/support/env.js');
// define module level Env vars here
process.env.ThisModule = path.resolve().split(PROJECTNAME)[1].split('/')[2];
// test env vars
process.env.ROOTPATH = '/';
process.env.LOGOID = '#logo';
process.env.LOGO_FILENAME = 'chromeLogo';
process.env.LOGO_TEXT = 'chrome';