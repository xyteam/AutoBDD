const fs = require('fs');
var projectHooks = {};
var localHooks = {};
if (fs.existsSync(`${process.env.PROJECTRUNPATH}/project/support/hooks.js`)) {
  projectHooks = require(`${process.env.PROJECTRUNPATH}/project/support/hooks.js`) || {};
}
if (fs.existsSync(`${process.env.PROJECTRUNPATH}/${process.env.ThisModule}/support/hooks.js`)) {
  projectHooks = require(`${process.env.PROJECTRUNPATH}/${process.env.ThisModule}/support/hooks.js`) || {};
}
exports.hooks = {
  onPrepare: function (config, capabilities) {
    if (projectHooks.onPrepare) projectHooks.onPrepare(config, capabilities);
    if (localHooks.onPrepare) localHooks.onPrepare(config, capabilities);
  },

  onWorkerStart: function (cid, caps, specs, args, execArgv) {
    if (projectHooks.onWorkerStart) projectHooks.onWorkerStart(cid, caps, specs, args, execArgv);
    if (localHooks.onWorkerStart) localHooks.onWorkerStart(cid, caps, specs, args, execArgv);
  },

  beforeSession: function (config, capabilities, specs) {
    if (projectHooks.beforeSession) projectHooks.beforeSession(config, capabilities, specs);
    if (localHooks.beforeSession) localHooks.beforeSession(config, capabilities, specs);
  },

  before: function (capabilities, specs) {
    if (projectHooks.before) projectHooks.before(capabilities, specs);
    if (localHooks.before) localHooks.before(capabilities, specs);
  },

  beforeSuite: function (suite) {
    if (projectHooks.beforeSuite) projectHooks.beforeSuite(suite);
    if (localHooks.beforeSuite) localHooks.beforeSuite(suite);
  },

  beforeHook: function (test, context/*, stepData, world*/) {
    if (projectHooks.beforeHook) projectHooks.beforeHook(test, context/*, stepData, world*/);
    if (localHooks.beforeHook) localHooks.beforeHook(test, context/*, stepData, world*/);
  },

  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    if (localHooks.afterHook) localHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (projectHooks.afterHook) projectHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: function (test, context) {
    if (localHooks.beforeTest) localHooks.beforeTest(test, context);
    if (projectHooks.beforeTest) projectHooks.beforeTest(test, context);
  },

  beforeCommand: function (commandName, args) {
    if (localHooks.beforeCommand) localHooks.beforeCommand(commandName, args);
    if (projectHooks.beforeCommand) projectHooks.beforeCommand(commandName, args);
  },

  beforeFeature: function (uri, feature, scenarios) {
    if (localHooks.BeforeFeature) localHooks.BeforeFeature(feature);
    if (projectHooks.BeforeFeature) projectHooks.BeforeFeature(feature);
  },

  beforeScenario: function (uri, feature, scenario, sourceLocation) {
    if (localHooks.BeforeScenario) localHooks.BeforeScenario(scenario);
    if (projectHooks.BeforeScenario) projectHooks.BeforeScenario(scenario);
  },

  beforeStep: function ({uri, feature, step}, context) {
    if (localHooks.BeforeStep) localHooks.BeforeStep(step.step);
    if (projectHooks.BeforeStep) projectHooks.BeforeStep(step.step);
  },

  afterStep: function ({uri, feature, step}, context, {error, result, duration, passed}) {
    if (localHooks.AfterStep) localHooks.AfterStep(step.step, passed);
    if (projectHooks.AfterStep) projectHooks.AfterStep(step.step, passed);
  },

  afterScenario: function (uri, feature, scenario, result, sourceLocation) {
    if (localHooks.AfterScenario) localHooks.AfterScenario(scenario, result);
    if (projectHooks.AfterScenario) projectHooks.AfterScenario(scenario, result);
  },

  afterFeature: function (uri, feature, scenarios) {
    if (localHooks.AfterFeature) localHooks.AfterFeature(feature);
    if (projectHooks.AfterFeature) projectHooks.AfterFeature(feature);
  },

  afterCommand: function (commandName, args, result, error) {
    if (localHooks.afterCommand) localHooks.afterCommand(commandName, args, result, error);
    if (projectHooks.afterCommand) projectHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (localHooks.afterTest) localHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (projectHooks.afterTest) projectHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: function (suite) {
    if (localHooks.afterSuite) localHooks.afterSuite(suite);
    if (projectHooks.afterSuite) projectHooks.afterSuite(suite);
  },

  after: function (result, capabilities, specs) {
    if (localHooks.after) localHooks.after(result, capabilities, specs);
    if (projectHooks.after) projectHooks.after(result, capabilities, specs);
  },

  afterSession: function (config, capabilities, specs) {
    if (localHooks.afterSession) localHooks.afterSession(config, capabilities, specs);
    if (projectHooks.afterSession) projectHooks.afterSession(config, capabilities, specs);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (localHooks.onComplete) localHooks.onComplete(exitCode, config, capabilities, results);
    if (projectHooks.onComplete) projectHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: function(oldSessionId, newSessionId) {
    if (localHooks.onReload) localHooks.onReload(oldSessionId, newSessionId);
    if (projectHooks.onReload) projectHooks.onReload(oldSessionId, newSessionId);
  },
}