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

  this.StepResult(function(stepResult) {
    const step = stepResult.getStep();
    const result = stepResult.getStatus();
    if (projectHooks) projectHooks.AfterStep(step, result);
  });

  this.After(function(scenario) {
    if (projectHooks) projectHooks.AfterScenario(scenario);
    browser.pause(1000);
  });

  this.AfterFeature(function(feature) {
    if (projectHooks) projectHooks.AfterFeature(feature);
  });
}