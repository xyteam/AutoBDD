const path = require('path');
const PROJECTBASE = process.env.PROJECTBASE || 'test-projects';
const PROJECTNAME = process.env.PROJECTNAME || path.resolve().split(PROJECTBASE)[1].split('/')[1];
var moduleDepth = path.resolve().split(PROJECTNAME)[1].split('/').length - 1;
var relativePathToProject = '../'.repeat(moduleDepth);
// define module level Env vars here
process.env.TestDir = path.resolve().split(PROJECTNAME)[1].split('/')[1];
process.env.TestModule = path.resolve().split(PROJECTNAME)[1].split('/')[2];
require(relativePathToProject + 'support/env.js');
// test env vars here
