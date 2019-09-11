// module_world
var projectWorld;
if (process.env.PROJECTRUNPATH) {
  projectWorld = require(process.env.PROJECTRUNPATH + '/project/support/world.js').World();  
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
