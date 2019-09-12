const path = require('path');
process.env.PROJECTBASE = process.env.PROJECTBASE || 'test-projects';
process.env.PROJECTNAME = process.env.PROJECTNAME || path.resolve().split(process.env.PROJECTBASE)[1].split('/')[1]
// if the framework is used
if (process.env.FrameworkPath) {
    process.env.PROJECTRUNPATH = process.env.FrameworkPath + '/' + process.env.PROJECTBASE + '/' + process.env.PROJECTNAME
    require(process.env.FrameworkPath + '/framework/support/env.js');
} else {
    process.env.PROJECTRUNPATH = path.resolve().split(process.env.PROJECTNAME)[0] + process.env.PROJECTNAME
}
// define project level Env vars here
