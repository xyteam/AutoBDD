var projectHooks;
if (process.env.FrameworkPath) {
  projectHooks = require(process.env.PROJECTRUNPATH + '/project/support/hooks.js');  
} else {
  projectHooks = null;
}

module.exports = function() {
  this.BeforeFeature(function(feature) {
    if (projectHooks) projectHooks.BeforeFeature(feature);
  });

  this.BeforeScenario(function(scenario) {
    if (projectHooks) projectHooks.BeforeScenario(scenario);
  });

  this.BeforeStep(function(step) {
    if (projectHooks) projectHooks.BeforeStep(step);
  });

  this.AfterStep(function(step) {
    if (projectHooks) projectHooks.AfterStep(step);
  });

  this.AfterScenario(function(scenario) {
    if (projectHooks) projectHooks.AfterScenario(scenario);
  });

  this.AfterFeature(function(feature) {
    if (projectHooks) projectHooks.AfterFeature(feature);
  });

  this.After(function(scenario) {
    if (projectHooks) projectHooks.AfterScenarioResult(scenario);
    browser.pause(1000);
  });
}