// if the framework is used
var frameworkHooks;
if (process.env.FrameworkPath) {
  frameworkHooks = require(process.env.FrameworkPath + '/framework/support/framework_hooks.js');  
} else {
  frameworkHooks = null;
}

const projectHooks = {
  // modify or add global hooks here
  BeforeFeature: function(feature, callback) {
    if (frameworkHooks) frameworkHooks.BeforeFeature(feature, callback);
    // additional hook code below this line
    callback();
  },

  BeforeScenario: function(scenario, callback) {
    if (frameworkHooks) frameworkHooks.BeforeScenario(scenario, callback);
    // additional hook code below this line
    callback();
  },

  BeforeStep: function(step, callback) {
    if (frameworkHooks) frameworkHooks.BeforeStep(step, callback);
    // additional hook code below this line
    callback();
  },

  AfterStep: function(step, callback) {
    if (frameworkHooks) frameworkHooks.AfterStep(step, callback);
    // additional hook code below this line
    callback();
  },

  AfterScenario: function(scenario, callback) {
    if (frameworkHooks) frameworkHooks.AfterScenario(scenario, callback);
    // additional hook code below this line
    callback();
  },

  AfterFeature: function(feature, callback) {
    if (frameworkHooks) frameworkHooks.AfterFeature(feature, callback);
    // additional hook code below this line
    callback();
  },
}

module.exports = projectHooks;

