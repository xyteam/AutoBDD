// module_world
const projectWorld = (process.env.PROJECTRUNPATH) ? require(process.env.PROJECTRUNPATH + '/project/support/world.js').World() : null;
const moduleWorld = {
  World: function() {
      var self = projectWorld;
      // add to module world as self.someName = someValue or someFunction here
      return self;
  }
}

module.exports = function() {
  this.World = moduleWorld.World;
}
