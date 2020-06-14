// if the framework is used
var frameworkHooks;
if (process.env.FrameworkPath) {
  frameworkHooks = require(process.env.FrameworkPath + '/framework/support/hooks.js');  
} else {
  frameworkHooks = null;
}

const projectHooks = {
  onPrepare: function (config, capabilities) {
    if (frameworkHooks) frameworkHooks.onPrepare(config, capabilities);
  },
  
  onWorkerStart: function (cid, caps, specs, args, execArgv) {
    if (frameworkHooks) frameworkHooks.onWorkerStart(cid, caps, specs, args, execArgv);
  },

  beforeSession: function (config, capabilities, specs) {
    if (frameworkHooks) frameworkHooks.beforeSession(config, capabilities, specs);
  },

  before: function (capabilities, specs) {
    if (frameworkHooks) frameworkHooks.before(capabilities, specs);
  },

  beforeSuite: function (suite) {
    if (frameworkHooks) frameworkHooks.beforeSuite(suite);
  },

  beforeHook: function (test, context/*, stepData, world*/) {
    if (frameworkHooks) frameworkHooks.beforeHook(test, context/*, stepData, world*/);
  },

  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    if (frameworkHooks) frameworkHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: function (test, context) {
    if (frameworkHooks) frameworkHooks.beforeTest(test, context);
  },

  beforeCommand: function (commandName, args) {
    if (frameworkHooks) frameworkHooks.beforeCommand(commandName, args);
  },

  BeforeFeature: function(feature) {
    if (frameworkHooks) frameworkHooks.BeforeFeature(feature);
  },

  BeforeScenario: function(scenario) {
    if (frameworkHooks) frameworkHooks.BeforeScenario(scenario);
  },

  BeforeStep: function(step) {
    if (frameworkHooks) frameworkHooks.BeforeStep(step);
  },

  AfterStep: function(step, passed) {
    if (frameworkHooks) frameworkHooks.AfterStep(step, passed);
  },

  AfterScenario: function(scenario, result) {
    if (frameworkHooks) frameworkHooks.AfterScenario(scenario, result);
  },

  AfterFeature: function(feature) {
    if (frameworkHooks) frameworkHooks.AfterFeature(feature);
  },

  afterCommand: function (commandName, args, result, error) {
    if (frameworkHooks) frameworkHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (frameworkHooks) frameworkHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: function (suite) {
    if (frameworkHooks) frameworkHooks.afterSuite(suite);
  },

  after: function (result, capabilities, specs) {
    if (frameworkHooks) frameworkHooks.after(result, capabilities, specs);
  },

  afterSession: function (config, capabilities, specs) {
    if (frameworkHooks) frameworkHooks.afterSession(config, capabilities, specs);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (frameworkHooks) frameworkHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: function(oldSessionId, newSessionId) {
    if (frameworkHooks) frameworkHooks.onReload(oldSessionId, newSessionId);
  },
}

module.exports = projectHooks;

