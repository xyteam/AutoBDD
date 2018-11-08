// if the framework is used
var frameworkWorld;
if (process.env.FrameworkPath) {
  frameworkWorld = require(process.env.FrameworkPath + '/framework/support/framework_world.js').World();  
} else {
  frameworkWorld = null;
}
// start of global vars for this test-project
const globalWorld = {
    World: function() {
      var self = frameworkWorld || this;
      // define global vars for this test-project below this line
      self.globalVar = 'this.globarVar defined in global/world.js';

      return self;
    }
}
module.exports = function(callback) {
  this.World = globalWorld.World;
}