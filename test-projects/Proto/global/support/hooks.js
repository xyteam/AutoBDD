const globalHooks = function() {
  // modify or add global hooks here
  this.BeforeFeature(function (event, callback) {
    console.log('from global/hooks.js')
    callback();
  });

  this.Before(function (scenario, callback) {
    callback();
  });

  this.BeforeScenario(function (event, callback) {
    callback();
  });

  this.BeforeStep(function (event, callback) {
    callback();
  });

  this.AfterStep(function (event, callback) {
    callback();
  });

  this.AfterScenario(function (event, callback) {
    callback();
  });

  this.After(function (scenario, callback) {
    callback();
  });

  this.AfterFeature(function (event, callback) {
    callback();
  });
}
module.exports = globalHooks;

