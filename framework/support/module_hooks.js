var projectHooks;
if (process.env.PROJECTRUNPATH) {
  projectHooks = require(process.env.PROJECTRUNPATH + '/project/support/hooks.js');  
} else {
  projectHooks = null;
}
exports.hooks = {

  onPrepare: function (config, capabilities) {
    if (projectHooks) projectHooks.onPrepare(config, capabilities);
  },

  onWorkerStart: function (cid, caps, specs, args, execArgv) {
    if (projectHooks) projectHooks.onWorkerStart(cid, caps, specs, args, execArgv);
  },

  beforeSession: function (config, capabilities, specs) {
    if (projectHooks) projectHooks.beforeSession(config, capabilities, specs);
  },

  before: function (capabilities, specs) {
    if (projectHooks) projectHooks.before(capabilities, specs);
  },

  beforeSuite: function (suite) {
    if (projectHooks) projectHooks.beforeSuite(suite);
  },

  beforeHook: function (test, context/*, stepData, world*/) {
    if (projectHooks) projectHooks.beforeHook(test, context/*, stepData, world*/);
  },

  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
    if (projectHooks) projectHooks.afterHook(test, context, { error, result, duration, passed, retries }/*, stepData, world*/);
  },

  beforeTest: function (test, context) {
    if (projectHooks) projectHooks.beforeTest(test, context);
  },

  beforeCommand: function (commandName, args) {
    if (projectHooks) projectHooks.beforeCommand(commandName, args);
  },

  beforeFeature: function (uri, feature, scenarios) {
    if (projectHooks) projectHooks.BeforeFeature(feature);
  },

  beforeScenario: function (uri, feature, scenario, sourceLocation) {
    if (projectHooks) projectHooks.BeforeScenario(scenario);
  },

  beforeStep: function ({uri, feature, step}, context) {
    if (projectHooks) projectHooks.BeforeStep(step.step);
  },

  afterStep: function ({uri, feature, step}, context, {error, result, duration, passed}) {
    if (projectHooks) projectHooks.AfterStep(step.step, passed);
  },

  afterScenario: function (uri, feature, scenario, result, sourceLocation) {
    if (projectHooks) projectHooks.AfterScenario(scenario, result);
  },

  afterFeature: function (uri, feature, scenarios) {
    if (projectHooks) projectHooks.AfterFeature(feature);
  },

  afterCommand: function (commandName, args, result, error) {
    if (projectHooks) projectHooks.afterCommand(commandName, args, result, error);
  },

  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    if (projectHooks) projectHooks.afterTest(test, context, { error, result, duration, passed, retries });
  },

  afterSuite: function (suite) {
    if (projectHooks) projectHooks.afterSuite(suite);
  },

  after: function (result, capabilities, specs) {
    if (projectHooks) projectHooks.after(result, capabilities, specs);
  },

  afterSession: function (config, capabilities, specs) {
    if (projectHooks) projectHooks.afterSession(config, capabilities, specs);
  },

  onComplete: function (exitCode, config, capabilities, results) {
    if (projectHooks) projectHooks.onComplete(exitCode, config, capabilities, results);
  },

  onReload: function(oldSessionId, newSessionId) {
    if (projectHooks) projectHooks.onReload(oldSessionId, newSessionId);
  },

}