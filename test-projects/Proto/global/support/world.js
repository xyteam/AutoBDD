
const frameworkWorld = require(process.env.FrameworkPath + '/framework/support/framework_world.js').World();
const globalWorld = {
    World: function() {
      var self = frameworkWorld;
      self.globalVar = 'defined in global/world.js';
      // define more global vars here
      return self;
    }
}
module.exports = function(callback) {
  this.World = globalWorld.World;
}