// project_world
const frameworkWorld = (process.env.FrameworkPath) ? require(process.env.FrameworkPath + '/framework/support/world.js').World() : null;
const projectWorld = {
  World: function() {
      var self = frameworkWorld;
      // add to project world as self.someName = someValue or someFunction here

      return self;
  }
}

module.exports = projectWorld;