// project_world
const glob = require('glob');
const path = require('path');
var frameworkWorld;
if (process.env.FrameworkPath) {
  frameworkWorld = require(process.env.FrameworkPath + '/framework/support/world.js').World();  
} else {
  frameworkWorld = null;
}

var projectWorld = frameworkWorld;

module.exports = projectWorld;