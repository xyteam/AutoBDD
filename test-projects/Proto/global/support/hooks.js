module.exports = function() {
  BeforeFeature(function (event, callback) {
    callback();
  });

  Before(function (scenario, callback) {
    callback();
  });

  BeforeScenario(function (event, callback) {
    callback();
  });

  BeforeStep(function (event, callback) {
    callback();
  });

  AfterStep(function (event, callback) {
    callback();
  });

  AfterScenario(function (event, callback) {
    callback();
  });

  After(function (scenario, callback) {
    callback();
  });

  AfterFeature(function (event, callback) {
    callback();
  });
}
