// project_world
var frameworkWorld;
if (process.env.FrameworkPath) {
  frameworkWorld = require(process.env.FrameworkPath + '/framework/support/framework_world.js').World();  
} else {
  frameworkWorld = null;
}

const projectWorld = {
    World: function() {
      var self = frameworkWorld || this;

      // define project_world variables here
      self.web_selectors = require('./test_selectors/web_selectors');
      self.seleniumPage_selectors = require('./test_selectors/seleniumPage_selectors');

      return self;
    }
}

module.exports = projectWorld;