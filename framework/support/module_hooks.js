const fs = require('fs');
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const TestModule = process.env.TestModule;
var frameworkHooks = {};
var projectHooks = {};
var localHooks = {};
if (fs.existsSync(`${FrameworkPath}/framework/support/hooks.js`)) {
  frameworkHooks = require(`${FrameworkPath}/framework/support/hooks.js`) || {};
}
if (fs.existsSync(`${ProjectPath}/${TestDir}/support/hooks.js`)) {
  projectHooks = require(`${ProjectPath}/${TestDir}/support/hooks.js`) || {};
}
if (fs.existsSync(`${ProjectPath}/${TestDir}/${TestModule}/support/hooks.js`)) {
  localHooks = require(`${ProjectPath}/${TestDir}/${TestModule}/support/hooks.js`) || {};
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
    if (frameworkHooks.afterHook) frameworkHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (projectHooks.afterHook) projectHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (localHooks.afterHook) localHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: function (test, context) {
    if (frameworkHooks.beforeTest) frameworkHooks.beforeTest(test, context);
    if (projectHooks.beforeTest) projectHooks.beforeTest(test, context);
    if (localHooks.beforeTest) localHooks.beforeTest(test, context);
  },

  beforeCommand: function (commandName, args) {
    if (frameworkHooks.beforeCommand) frameworkHooks.beforeCommand(commandName, args);
    if (projectHooks.beforeCommand) projectHooks.beforeCommand(commandName, args);
    if (localHooks.beforeCommand) localHooks.beforeCommand(commandName, args);
  },

  beforeFeature: function (uri, feature, scenarios) {
    if (frameworkHooks.beforeFeature) frameworkHooks.beforeFeature(uri, feature, scenarios);
    if (projectHooks.beforeFeature) projectHooks.beforeFeature(uri, feature, scenarios);
    if (localHooks.beforeFeature) localHooks.beforeFeature(uri, feature, scenarios);
  },

  beforeScenario: function (uri, feature, scenario, sourceLocation) {
    if (frameworkHooks.beforeScenario) frameworkHooks.beforeScenario(uri, feature, scenario, sourceLocation);
    if (projectHooks.beforeScenario) projectHooks.beforeScenario(uri, feature, scenario, sourceLocation);
    if (localHooks.beforeScenario) localHooks.beforeScenario(uri, feature, scenario, sourceLocation);
  },

  beforeStep: function ({uri, feature, step}, context) {
    if (frameworkHooks.beforeStep) frameworkHooks.beforeStep({uri, feature, step}, context);
    if (projectHooks.beforeStep) projectHooks.beforeStep({uri, feature, step}, context);
    if (localHooks.beforeStep) localHooks.beforeStep({uri, feature, step}, context);
  },

  afterStep: function ({uri, feature, step}, context, {error, result, duration, passed}) {
    if (frameworkHooks.afterStep) frameworkHooks.afterStep({uri, feature, step}, context, {error, result, duration, passed});
    if (projectHooks.afterStep) projectHooks.afterStep({uri, feature, step}, context, {error, result, duration, passed});
    if (localHooks.afterStep) localHooks.afterStep({uri, feature, step}, context, {error, result, duration, passed});
  },

  afterScenario: function (uri, feature, scenario, result, sourceLocation) {
    if (frameworkHooks.afterScenario) frameworkHooks.afterScenario(uri, feature, scenario, result, sourceLocation);
    if (projectHooks.afterScenario) projectHooks.afterScenario(uri, feature, scenario, result, sourceLocation);
    if (localHooks.afterScenario) localHooks.afterScenario(uri, feature, scenario, result, sourceLocation);
  },

  afterFeature: function (uri, feature, scenarios) {
    if (frameworkHooks.afterFeature) frameworkHooks.afterFeature(uri, feature, scenarios);
    if (projectHooks.afterFeature) projectHooks.afterFeature(uri, feature, scenarios);
    if (localHooks.afterFeature) localHooks.afterFeature(uri, feature, scenarios);
  },

  afterCommand: function (commandName, args, result, error) {
    if (frameworkHooks.afterCommand) frameworkHooks.afterCommand(commandName, args, result, error);
    if (projectHooks.afterCommand) projectHooks.afterCommand(commandName, args, result, error);
    if (localHooks.afterCommand) localHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (frameworkHooks.afterTest) frameworkHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (projectHooks.afterTest) projectHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (localHooks.afterTest) localHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: function (suite) {
    if (frameworkHooks.afterSuite) frameworkHooks.afterSuite(suite);
    if (projectHooks.afterSuite) projectHooks.afterSuite(suite);
    if (localHooks.afterSuite) localHooks.afterSuite(suite);
  },

  after: function (result, capabilities, specs) {
    if (frameworkHooks.after) frameworkHooks.after(result, capabilities, specs);
    if (projectHooks.after) projectHooks.after(result, capabilities, specs);
    if (localHooks.after) localHooks.after(result, capabilities, specs);
  },

  afterSession: function (config, capabilities, specs) {
    if (frameworkHooks.afterSession) frameworkHooks.afterSession(config, capabilities, specs);
    if (projectHooks.afterSession) projectHooks.afterSession(config, capabilities, specs);
    if (localHooks.afterSession) localHooks.afterSession(config, capabilities, specs);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (frameworkHooks.onComplete) frameworkHooks.onComplete(exitCode, config, capabilities, results);
    if (projectHooks.onComplete) projectHooks.onComplete(exitCode, config, capabilities, results);
    if (localHooks.onComplete) localHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: function(oldSessionId, newSessionId) {
    if (frameworkHooks.onReload) frameworkHooks.onReload(oldSessionId, newSessionId);
    if (projectHooks.onReload) projectHooks.onReload(oldSessionId, newSessionId);
    if (localHooks.onReload) localHooks.onReload(oldSessionId, newSessionId);
  },
}