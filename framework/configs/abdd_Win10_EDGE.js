'use strict';
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const selenium_standalone_config = require(FrameworkPath + '/framework/configs/selenium-standalone_config.js');
const myCombinedStepPath = [`${FrameworkPath}/framework/step_files/browser/*.js`,
                            `${FrameworkPath}/framework/step_files/screen/*.js`,
                            `${FrameworkPath}/framework/step_files/postman/*.js`,
                            `${FrameworkPath}/framework/step_files/maven/*.js`,
                            `${ProjectPath}/${TestDir}/support/steps/**/*.js`,
                            `support/steps/*.js`];
const myDownloadPathLocal = process.env.DownloadPathLocal || '/tmp/download_' + process.env.DISPLAY.substr(1);

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
    version: selenium_standalone_config.version,
    drivers: selenium_standalone_config.drivers,
    baseURL: selenium_standalone_config.baseURL
  },

  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
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
    logLevel: 'silent',
    coloredLogs: true,
    screenshotPath: null,
    waitforTimeout: 500,
    waitforInterval: 250
  },

  // - - - - SESSION-MANAGER  - - - -
  noSessionReuse: false,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  debugCucumber: false,
  debugBrkCucumber: false
};

