// if the framework is used
var frameworkHooks;
if (process.env.FrameworkPath) {
  frameworkHooks = require(process.env.FrameworkPath + '/framework/support/framework_hooks.js');  
} else {
  frameworkHooks = null;
}

const globalHooks = function() {
  // modify or add global hooks here
  this.BeforeFeature(function (event, callback) {
    if (frameworkHooks) frameworkHooks.BeforeFeature(event);
    // additional hook code below this line
    if (process.env.DebugTestProject == 1) console.log('from global/hooks.js');
    callback();
  });

  this.Before(function (scenario, callback) {
    if (frameworkHooks) frameworkHooks.Before(scenario);
    // additional hook code below this line
    callback();
  });

  this.BeforeScenario(function (event, callback) {
    if (frameworkHooks) frameworkHooks.BeforeScenario(event);
    // additional hook code below this line
    callback();
  });

  this.BeforeStep(function (event, callback) {
    if (frameworkHooks) frameworkHooks.BeforeStep(event);
    // additional hook code below this line
    callback();
  });

  this.AfterStep(function (event, callback) {
    if (frameworkHooks) frameworkHooks.AfterStep(event);
    // additional hook code below this line
    callback();
  });

  this.AfterScenario(function (event, callback) {
    if (frameworkHooks) frameworkHooks.AfterScenario(event);
    // additional hook code below this line
    callback();
  });

  this.After(function (scenario, callback) {
    if (frameworkHooks) frameworkHooks.After(scenario);
    // additional hook code below this line
    callback();
  });

  this.AfterFeature(function (event, callback) {
    if (frameworkHooks) frameworkHooks.AfterFeature(event);
    // additional hook code below this line
    callback();
  });
}
module.exports = globalHooks;

