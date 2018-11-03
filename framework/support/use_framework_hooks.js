const myFramework_hooks=require(process.env.FrameworkPath + "/global/support/framework_hooks");

module.exports = function() {
  this.BeforeFeature(function (event, callback) {
   myFramework_hooks.BeforeFeature(event);
    callback();
  });

  this.Before(function (scenario, callback) {
   myFramework_hooks.Before(scenario);
    callback();
  });

  this.BeforeScenario(function (event, callback) {
   myFramework_hooks.BeforeScenario(event);
    callback();
  });

  this.BeforeStep(function (event, callback) {
   myFramework_hooks.BeforeStep(event);
    callback();
  });

  this.AfterStep(function (event, callback) {
   myFramework_hooks.AfterStep(event);
    callback();
  });

  this.AfterScenario(function (event, callback) {
   myFramework_hooks.AfterScenario(event);
    callback();
  });

  this.After(function (scenario, callback) {
   myFramework_hooks.After(scenario);
    callback();
  });

  this.AfterFeature(function (event, callback) {
   myFramework_hooks.AfterFeature(event);
    callback();
  });
}
