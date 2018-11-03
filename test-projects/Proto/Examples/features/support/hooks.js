const global_hooks=require("../../../global/support/hooks");

module.exports = function() {
  this.BeforeFeature(function (event, callback) {
   global_hooks.BeforeFeature(event);
    callback();
  });

  this.Before(function (scenario, callback) {
   global_hooks.Before(scenario);
    callback();
  });

  this.BeforeScenario(function (event, callback) {
   global_hooks.BeforeScenario(event);
    callback();
  });

  this.BeforeStep(function (event, callback) {
   global_hooks.BeforeStep(event);
    callback();
  });

  this.AfterStep(function (event, callback) {
   global_hooks.AfterStep(event);
    callback();
  });

  this.AfterScenario(function (event, callback) {
   global_hooks.AfterScenario(event);
    callback();
  });

  this.After(function (scenario, callback) {
   global_hooks.After(scenario);
    callback();
  });

  this.AfterFeature(function (event, callback) {
   global_hooks.AfterFeature(event);
    callback();
  });
}
