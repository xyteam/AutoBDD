// module_world
var projectWorld;
if (process.env.PROJECTRUNPATH) {
  projectWorld = require(process.env.PROJECTRUNPATH + '/project/support/world.js').World();  
} else {
  projectWorld = null;
}

var moduleWorld = projectWorld;

module.exports = moduleWorld;