var projectHooks;
if (process.env.FrameworkPath) {
  projectHooks = require(process.env.ProjectPath + '/project/support/hooks.js');  
} else {
  projectHooks = null;
}

module.exports = function() {
  this.Before(function(feature, callback) {
    if (projectHooks) projectHooks.BeforeFeature(feature, callback);
    // additional hook code below this line
    callback();
  });

  this.Before(function(scenario, callback) {
    if (projectHooks) projectHooks.BeforeScenario(scenario, callback);
    // additional hook code below this line
    callback();
  });

  this.Before(function(event, callback) {
    if (projectHooks) projectHooks.BeforeStep(event, callback);
    // additional hook code below this line
    callback();
  });

  this.After(function(event, callback) {
    if (projectHooks) projectHooks.AfterStep(event, callback);
    // additional hook code below this line
    callback();
  });

  this.After(function(scenario, callback) {
    if (projectHooks) projectHooks.AfterScenario(scenario, callback);
    // additional hook code below this line
    callback();
  });

  this.After(function(feature, callback) {
    if (projectHooks) projectHooks.AfterFeature(feature, callback);
    // additional hook code below this line
    callback();
  });
}