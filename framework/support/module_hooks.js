const fs = require('fs');
var frameworkHooks = {};
var projectHooks = {};
var localHooks = {};
if (fs.existsSync(`${process.env.FrameworkPath}/framework/support/hooks.js`)) {
  frameworkHooks = require(`${process.env.FrameworkPath}/framework/support/hooks.js`) || {};
}
if (fs.existsSync(`${process.env.PROJECTRUNPATH}/project/support/hooks.js`)) {
  projectHooks = require(`${process.env.PROJECTRUNPATH}/project/support/hooks.js`) || {};
}
if (fs.existsSync(`${process.env.PROJECTRUNPATH}/${process.env.ThisModule}/support/hooks.js`)) {
  localHooks = require(`${process.env.PROJECTRUNPATH}/${process.env.ThisModule}/support/hooks.js`) || {};
}
exports.hooks = {
  onPrepare: function (config, capabilities) {
    if (frameworkHooks.onPrepare) frameworkHooks.onPrepare(config, capabilities);
    if (projectHooks.onPrepare) projectHooks.onPrepare(config, capabilities);
    if (localHooks.onPrepare) localHooks.onPrepare(config, capabilities);
  },

  onWorkerStart: function (cid, caps, specs, args, execArgv) {
    if (frameworkHooks.onWorkerStart) frameworkHooks.onWorkerStart(cid, caps, specs, args, execArgv);
    if (projectHooks.onWorkerStart) projectHooks.onWorkerStart(cid, caps, specs, args, execArgv);
    if (localHooks.onWorkerStart) localHooks.onWorkerStart(cid, caps, specs, args, execArgv);
  },

  beforeSession: function (config, capabilities, specs) {
    if (frameworkHooks.beforeSession) frameworkHooks.beforeSession(config, capabilities, specs);
    if (projectHooks.beforeSession) projectHooks.beforeSession(config, capabilities, specs);
    if (localHooks.beforeSession) localHooks.beforeSession(config, capabilities, specs);
  },

  before: function (capabilities, specs) {
    if (frameworkHooks.before) frameworkHooks.before(capabilities, specs);
    if (projectHooks.before) projectHooks.before(capabilities, specs);
    if (localHooks.before) localHooks.before(capabilities, specs);
  },

  beforeSuite: function (suite) {
    if (frameworkHooks.beforeSuite) frameworkHooks.beforeSuite(suite);
    if (projectHooks.beforeSuite) projectHooks.beforeSuite(suite);
    if (localHooks.beforeSuite) localHooks.beforeSuite(suite);
  },

  beforeHook: function (test, context/*, stepData, world*/) {
    if (frameworkHooks.beforeHook) frameworkHooks.beforeHook(test, context/*, stepData, world*/);
    if (projectHooks.beforeHook) projectHooks.beforeHook(test, context/*, stepData, world*/);
    if (localHooks.beforeHook) localHooks.beforeHook(test, context/*, stepData, world*/);
  },

  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    if (localHooks.afterHook) localHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (projectHooks.afterHook) projectHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (frameworkHooks.afterHook) frameworkHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: function (test, context) {
    if (localHooks.beforeTest) localHooks.beforeTest(test, context);
    if (projectHooks.beforeTest) projectHooks.beforeTest(test, context);
    if (frameworkHooks.beforeTest) frameworkHooks.beforeTest(test, context);
  },

  beforeCommand: function (commandName, args) {
    if (localHooks.beforeCommand) localHooks.beforeCommand(commandName, args);
    if (projectHooks.beforeCommand) projectHooks.beforeCommand(commandName, args);
    if (frameworkHooks.beforeCommand) frameworkHooks.beforeCommand(commandName, args);
  },

  beforeFeature: function (uri, feature, scenarios) {
    if (localHooks.BeforeFeature) localHooks.BeforeFeature(feature);
    if (projectHooks.BeforeFeature) projectHooks.BeforeFeature(feature);
    if (frameworkHooks.BeforeFeature) frameworkHooks.BeforeFeature(feature);
  },

  beforeScenario: function (uri, feature, scenario, sourceLocation) {
    if (localHooks.BeforeScenario) localHooks.BeforeScenario(scenario);
    if (projectHooks.BeforeScenario) projectHooks.BeforeScenario(scenario);
    if (frameworkHooks.BeforeScenario) frameworkHooks.BeforeScenario(scenario);
  },

  beforeStep: function ({uri, feature, step}, context) {
    if (localHooks.BeforeStep) localHooks.BeforeStep(step.step);
    if (projectHooks.BeforeStep) projectHooks.BeforeStep(step.step);
    if (frameworkHooks.BeforeStep) frameworkHooks.BeforeStep(step.step);
  },

  afterStep: function ({uri, feature, step}, context, {error, result, duration, passed}) {
    if (localHooks.AfterStep) localHooks.AfterStep(step.step, passed);
    if (projectHooks.AfterStep) projectHooks.AfterStep(step.step, passed);
    if (frameworkHooks.AfterStep) frameworkHooks.AfterStep(step.step, passed);
  },

  afterScenario: function (uri, feature, scenario, result, sourceLocation) {
    if (localHooks.AfterScenario) localHooks.AfterScenario(scenario, result);
    if (projectHooks.AfterScenario) projectHooks.AfterScenario(scenario, result);
    if (frameworkHooks.AfterScenario) frameworkHooks.AfterScenario(scenario, result);
  },

  afterFeature: function (uri, feature, scenarios) {
    if (localHooks.AfterFeature) localHooks.AfterFeature(feature);
    if (projectHooks.AfterFeature) projectHooks.AfterFeature(feature);
    if (frameworkHooks.AfterFeature) frameworkHooks.AfterFeature(feature);
  },

  afterCommand: function (commandName, args, result, error) {
    if (localHooks.afterCommand) localHooks.afterCommand(commandName, args, result, error);
    if (projectHooks.afterCommand) projectHooks.afterCommand(commandName, args, result, error);
    if (frameworkHooks.afterCommand) frameworkHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (localHooks.afterTest) localHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (projectHooks.afterTest) projectHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (frameworkHooks.afterTest) frameworkHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: function (suite) {
    if (localHooks.afterSuite) localHooks.afterSuite(suite);
    if (projectHooks.afterSuite) projectHooks.afterSuite(suite);
    if (frameworkHooks.afterSuite) frameworkHooks.afterSuite(suite);
  },

  after: function (result, capabilities, specs) {
    if (localHooks.after) localHooks.after(result, capabilities, specs);
    if (projectHooks.after) projectHooks.after(result, capabilities, specs);
    if (frameworkHooks.after) frameworkHooks.after(result, capabilities, specs);
  },

  afterSession: function (config, capabilities, specs) {
    if (localHooks.afterSession) localHooks.afterSession(config, capabilities, specs);
    if (projectHooks.afterSession) projectHooks.afterSession(config, capabilities, specs);
    if (frameworkHooks.afterSession) frameworkHooks.afterSession(config, capabilities, specs);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (localHooks.onComplete) localHooks.onComplete(exitCode, config, capabilities, results);
    if (projectHooks.onComplete) projectHooks.onComplete(exitCode, config, capabilities, results);
    if (frameworkHooks.onComplete) frameworkHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: function(oldSessionId, newSessionId) {
    if (localHooks.onReload) localHooks.onReload(oldSessionId, newSessionId);
    if (projectHooks.onReload) projectHooks.onReload(oldSessionId, newSessionId);
    if (frameworkHooks.onReload) frameworkHooks.onReload(oldSessionId, newSessionId);
  },
}