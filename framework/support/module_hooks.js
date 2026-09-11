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
  onPrepare: async function (config, capabilities) {
    if (frameworkHooks.onPrepare) await frameworkHooks.onPrepare(config, capabilities);
    if (projectHooks.onPrepare) await projectHooks.onPrepare(config, capabilities);
    if (localHooks.onPrepare) await localHooks.onPrepare(config, capabilities);
  },

  onWorkerStart: async function (cid, caps, specs, args, execArgv) {
    if (frameworkHooks.onWorkerStart) await frameworkHooks.onWorkerStart(cid, caps, specs, args, execArgv);
    if (projectHooks.onWorkerStart) await projectHooks.onWorkerStart(cid, caps, specs, args, execArgv);
    if (localHooks.onWorkerStart) await localHooks.onWorkerStart(cid, caps, specs, args, execArgv);
  },

  beforeSession: async function (config, capabilities, specs) {
    if (frameworkHooks.beforeSession) await frameworkHooks.beforeSession(config, capabilities, specs);
    if (projectHooks.beforeSession) await projectHooks.beforeSession(config, capabilities, specs);
    if (localHooks.beforeSession) await localHooks.beforeSession(config, capabilities, specs);
  },

  before: async function (capabilities, specs) {
    if (frameworkHooks.before) await frameworkHooks.before(capabilities, specs);
    if (projectHooks.before) await projectHooks.before(capabilities, specs);
    if (localHooks.before) await localHooks.before(capabilities, specs);
  },

  beforeSuite: async function (suite) {
    if (frameworkHooks.beforeSuite) await frameworkHooks.beforeSuite(suite);
    if (projectHooks.beforeSuite) await projectHooks.beforeSuite(suite);
    if (localHooks.beforeSuite) await localHooks.beforeSuite(suite);
  },

  beforeHook: async function (test, context/*, stepData, world*/) {
    if (frameworkHooks.beforeHook) await frameworkHooks.beforeHook(test, context/*, stepData, world*/);
    if (projectHooks.beforeHook) await projectHooks.beforeHook(test, context/*, stepData, world*/);
    if (localHooks.beforeHook) await localHooks.beforeHook(test, context/*, stepData, world*/);
  },

  afterHook: async function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    if (frameworkHooks.afterHook) await frameworkHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (projectHooks.afterHook) await projectHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
    if (localHooks.afterHook) await localHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: async function (test, context) {
    if (frameworkHooks.beforeTest) await frameworkHooks.beforeTest(test, context);
    if (projectHooks.beforeTest) await projectHooks.beforeTest(test, context);
    if (localHooks.beforeTest) await localHooks.beforeTest(test, context);
  },

  beforeCommand: async function (commandName, args) {
    if (frameworkHooks.beforeCommand) await frameworkHooks.beforeCommand(commandName, args);
    if (projectHooks.beforeCommand) await projectHooks.beforeCommand(commandName, args);
    if (localHooks.beforeCommand) await localHooks.beforeCommand(commandName, args);
  },

  beforeFeature: async function (uri, feature) {
    if (frameworkHooks.beforeFeature) await frameworkHooks.beforeFeature(uri, feature);
    if (projectHooks.beforeFeature) await projectHooks.beforeFeature(uri, feature);
    if (localHooks.beforeFeature) await localHooks.beforeFeature(uri, feature);
  },

  beforeScenario: async function (context) {
    if (frameworkHooks.beforeScenario) await frameworkHooks.beforeScenario(context);
    if (projectHooks.beforeScenario) await projectHooks.beforeScenario(context);
    if (localHooks.beforeScenario) await localHooks.beforeScenario(context);
  },

  beforeStep: async function (step, context) {
    if (frameworkHooks.beforeStep) await frameworkHooks.beforeStep(step, context);
    if (projectHooks.beforeStep) await projectHooks.beforeStep(step, context);
    if (localHooks.beforeStep) await localHooks.beforeStep(step, context);
  },

  afterStep: async function (step, context, {error, result, duration, passed}) {
    if (frameworkHooks.afterStep) await frameworkHooks.afterStep(step, context, {error, result, duration, passed});
    if (projectHooks.afterStep) await projectHooks.afterStep(step, context, {error, result, duration, passed});
    if (localHooks.afterStep) await localHooks.afterStep(step, context, {error, result, duration, passed});
  },

  afterScenario: async function (context, result, thisWorld) {
    if (frameworkHooks.afterScenario) await frameworkHooks.afterScenario(context, result, thisWorld);
    if (projectHooks.afterScenario) await projectHooks.afterScenario(context, result, thisWorld);
    if (localHooks.afterScenario) await localHooks.afterScenario(context, result, thisWorld);
  },

  afterFeature: async function (uri, feature) {
    if (frameworkHooks.afterFeature) await frameworkHooks.afterFeature(uri, feature);
    if (projectHooks.afterFeature) await projectHooks.afterFeature(uri, feature);
    if (localHooks.afterFeature) await localHooks.afterFeature(uri, feature);
  },

  afterCommand: async function (commandName, args, result, error) {
    if (frameworkHooks.afterCommand) await frameworkHooks.afterCommand(commandName, args, result, error);
    if (projectHooks.afterCommand) await projectHooks.afterCommand(commandName, args, result, error);
    if (localHooks.afterCommand) await localHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (frameworkHooks.afterTest) await frameworkHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (projectHooks.afterTest) await projectHooks.afterTest(test, context, { error, result, duration, passed, retries });
    if (localHooks.afterTest) await localHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: async function (suite) {
    if (frameworkHooks.afterSuite) await frameworkHooks.afterSuite(suite);
    if (projectHooks.afterSuite) await projectHooks.afterSuite(suite);
    if (localHooks.afterSuite) await localHooks.afterSuite(suite);
  },

  after: async function (result, capabilities, specs) {
    if (frameworkHooks.after) await frameworkHooks.after(result, capabilities, specs);
    if (projectHooks.after) await projectHooks.after(result, capabilities, specs);
    if (localHooks.after) await localHooks.after(result, capabilities, specs);
  },

  afterSession: async function (config, capabilities, specs) {
    if (frameworkHooks.afterSession) await frameworkHooks.afterSession(config, capabilities, specs);
    if (projectHooks.afterSession) await projectHooks.afterSession(config, capabilities, specs);
    if (localHooks.afterSession) await localHooks.afterSession(config, capabilities, specs);
  },

  onComplete: async function (exitCode, config, capabilities, results) {
    if (frameworkHooks.onComplete) await frameworkHooks.onComplete(exitCode, config, capabilities, results);
    if (projectHooks.onComplete) await projectHooks.onComplete(exitCode, config, capabilities, results);
    if (localHooks.onComplete) await localHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: async function(oldSessionId, newSessionId) {
    if (frameworkHooks.onReload) await frameworkHooks.onReload(oldSessionId, newSessionId);
    if (projectHooks.onReload) await projectHooks.onReload(oldSessionId, newSessionId);
    if (localHooks.onReload) await localHooks.onReload(oldSessionId, newSessionId);
  },
}
