'use strict';
const fs = require('fs');
const glob = require('glob');
const _path = require('path');
const _path2 = _interopRequireDefault(_path);
const myChimpDir = process.env.HOME + '/node_modules/chimpy/';
const _ci = require(myChimpDir + './dist/lib/ci');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; };
const _selenium_standalone = require('./selenium-standalone_config.js');
const myFrameworkPath = process.env.FrameworkPath;
const myGlobalStepPath = myFrameworkPath + '/global/step_definitions';
const myCombinedStepPath = fs.existsSync('../step_definitions') ? ['./features', '../step_definitions', myGlobalStepPath] : ['./features', myGlobalStepPath];
const myDISPLAYSIZE = process.env.DISPLAYSIZE;

module.exports = {
  // - - - - CHIMP - - - -
  watch: false,
  // @focus is recommended to use. @dev and @watch are deprecated.
  watchTags: '@focus,@dev,@watch',
  watchWithPolling: false,
  criticalSteps: null,
  criticalTag: '@critical',
  server: false,
  serverPort: 8060,
  serverHost: 'localhost',
  sync: true,
  offline: true,

  // - - - - CUCUMBER - - - -
  path: './features',
  require: myCombinedStepPath,
  format: 'pretty',
  tags: ['~@prod_only','~@wip'],
  singleSnippetPerFile: true,
  recommendedFilenameSeparator: '_',
  chai: false,
  screenshotsOnError: (0, _ci.isCI)(),
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: false,
  // Note: With a large viewport size and captureAllStepScreenshots enabled,
  // you may run out of memory. Use browser.setViewportSize to make the
  // viewport size smaller.
  saveScreenshotsToReport: false,
  jsonOutput: null,
  compiler: 'js:' + _path2.default.resolve(myChimpDir, './dist/lib/babel-register.js'),

  // - - - - SELENIUM  - - - -
  browser: 'internet explorer',
  platform: 'windows',
  name: '',
  user: '',
  key: '',
  port: process.env.SELPORT,
  host: process.env.RDPHOST,
  // deviceName: null,

  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    sync: true,
    deprecationWarnings: false,
    logLevel: 'verbose',
    // logOutput: null,
    host: process.env.RDPHOST,
    port: process.env.SELPORT,
    path: '/wd/hub',
    baseUrl: '',
    coloredLogs: true,
    screenshotPath: null,
    waitforTimeout: 1800,
    waitforInterval: 150,
    desiredCapabilities: {
      browserName: "internet explorer",
      initialBrowserUrl: "about:blank",
      pageLoadStrategy: "eager",
      unhandledPromptBehavior: "dismiss",
      takesScreenshot: true,
      javascriptEnabled: true,
      cssSelectorsEnabled: true,
      unexpectedAlertBehaviour: "dismiss",
      browserAttachTimeout: 0,
      elementScrollBehavior: 0,
      enableElementCacheCleanup: true,
      enablePersistentHover: true,
      ignoreProtectedModeSettings: false,
      ignoreZoomSetting: true,
      nativeEvents: true,
      requireWindowFocus: true,
      // "ie.browserCommandLineSwitches": "",
      // "ie.enableFullPageScreenshot": true,
      // "ie.ensureCleanSession": true,
      // "ie.fileUploadDialogTimeout": 3000,
      // "ie.forceCreateProcessApi": false,
      // "ie.forceShellWindowsApi": false,
      // "ie.useLegacyFileUploadDialogHandling": false
    }
  },

  // - - - - SELENIUM-STANDALONE
  seleniumStandaloneOptions: {
    version: _selenium_standalone.version,
    drivers: _selenium_standalone.drivers
  },

  // - - - - SESSION-MANAGER  - - - -
  noSessionReuse: false,

  // - - - - SIMIAN  - - - -
  simianResultEndPoint: 'api.simian.io/v1.0/result',
  simianAccessToken: false,
  simianResultBranch: null,
  simianRepositoryId: null,

  // - - - - MOCHA  - - - -
  mocha: false,
  // 'path: './tests',
  mochaTimeout: 60000,
  mochaReporter: 'spec',
  mochaSlow: 10000,

  // - - - - JASMINE  - - - -
  jasmine: false,
  jasmineConfig: {
    specDir: '.',
    specFiles: ['**/*@(_spec|-spec|Spec).@(js|jsx)'],
    helpers: ['support/**/*.@(js|jsx)'],
    stopSpecOnExpectationFailure: false,
    random: false
  },
  jasmineReporterConfig: {
    // This options are passed to jasmine.configureDefaultReporter(...)
    // See: http://jasmine.github.io/2.4/node.html#section-Reporters
  },

  // - - - - METEOR  - - - -
  ddp: false,

  // - - - - PHANTOM  - - - -
  phantom_w: 1280,
  phantom_h: 1024,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  seleniumDebug: null,
  debugCucumber: null,
  debugBrkCucumber: null,
  debugMocha: null,
  debugBrkMocha: null
};
