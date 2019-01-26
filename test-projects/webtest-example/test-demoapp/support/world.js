// // module_world
// var projectWorld;
// if (process.env.ProjectPath) {
//   projectWorld = require(process.env.ProjectPath + '/project/support/project_world.js').World();  
// } else {
//   projectWorld = null;
// }

// const moduleWorld = {
//     World: function() {
//       var self = projectWorld || this;

//       // define module_world variables here
//       return self;
//     }
// }

'use strict';

var World = function World(callback) {

  this.createGroceryItem = function() {
    return 'apple';
  };

  callback();

};

module.exports.World = World;