// module_world
var projectWorld;
if (process.env.ProjectPath) {
  projectWorld = require(process.env.ProjectPath + '/project/support/project_world.js').World();  
} else {
  projectWorld = null;
}

function World() {
  var self = projectWorld;
  // add module level world items here
  return self;
}

module.exports = function(callback) {
  this.World = World;
}
