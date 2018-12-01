'use strict';
const frameworkPath = process.env.FrameworkPath;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _path = require('path');
const _path2 = _interopRequireDefault(_path);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; };
const _selenium_standalone = require(frameworkPath + '/framework/configs/selenium-standalone_config.js');
const frameworkStepPath = frameworkPath + '/framework/step_definitions';
const myCombinedStepPath = fs.existsSync('../step_definitions') ? ['./features', '../step_definitions'] : ['./features'];

module.exports = {
  // - - - - CHIMP - - - -
  watch: false,
  watchTags: '@watch,@focus',
  domainSteps: null,
  e2eSteps: null,
  fullDomain: false,
  domainOnly: false,
  e2eTags: '@e2e',
  watchWithPolling: false,
  server: false,
  serverPort: 8060,
  serverHost: 'localhost',
  sync: true,
  offline: true,
  showXolvioMessages: true,
  'fail-when-no-tests-run': false,

  // - - - - CUCUMBER - - - -
  path: 'features',
  require: myCombinedStepPath,
  format: 'pretty',
  tags: '~@ignore',
  singleSnippetPerFile: true,
  recommendedFilenameSeparator: '_',
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: false,
  jsonOutput: null,
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'MicrosoftEdge',
  platform: 'Windows 10',
  name: '',
  user: '',
  key: '',
  host: process.env.SELHOST,
  port: process.env.SELPORT,
  seleniumStandaloneOptions: {
    version: _selenium_standalone.version,
    drivers: _selenium_standalone.drivers,
    baseURL: _selenium_standalone.baseURL
  },

  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    sync: true,
    deprecationWarnings: false,
    logLevel: 'silent',
    coloredLogs: true,
    screenshotPath: null,
    waitforTimeout: 1800,
    waitforInterval: 150,
    desiredCapabilities: {
      browserName: "MicrosoftEdge",
      initialBrowserUrl: "about:blank",
      pageLoadStrategy: "normal",
      unhandledPromptBehavior: "dismiss",
      takesScreenshot: true,
      javascriptEnabled: true,
      cssSelectorsEnabled: true,
      unexpectedAlertBehaviour: "dismiss",
      elementScrollBehavior: 0,
      nativeEvents: true,
    },
  },

  // - - - - SESSION-MANAGER  - - - -
  noSessionReuse: false,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  debugCucumber: false,
  debugBrkCucumber: false
};

