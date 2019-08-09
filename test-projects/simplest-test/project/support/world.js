// project_world
const glob = require('glob');
const path = require('path');
var frameworkWorld;
if (process.env.FrameworkPath) {
  frameworkWorld = require(process.env.FrameworkPath + '/framework/support/world.js').World();  
} else {
  frameworkWorld = null;
}

const projectWorld = {
    World: function() {
      var self = frameworkWorld || this;

      // define project_world variables here    
      glob.sync('./steps/**/*.js').forEach( function(file) {
        self.project_steps += require(path.resolve(file));
      });
    
      return self;
    }
}

module.exports = projectWorld;