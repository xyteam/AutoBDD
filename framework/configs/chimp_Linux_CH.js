'use strict';
const frameworkPath = process.env.FrameworkPath;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _path = require('path');
const _path2 = _interopRequireDefault(_path);
// const myChimpDir = frameworkPath + '/node_modules/chimpy/';
// const _ci = require(myChimpDir + './dist/lib/ci');
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; };
const _selenium_standalone = require(frameworkPath + '/framework/configs/selenium-standalone_config.js');
const frameworkStepPath = frameworkPath + '/framework/step_definitions';
const myCombinedStepPath = fs.existsSync('../step_definitions') ? ['./features', '../step_definitions'] : ['./features'];

// for Linux chrome
const myDownloadPathLocal = '/tmp/download_' + process.env.DISPLAY.substr(1);
const myChromeProfilePath = process.env.myChromeProfilePath || '/tmp/chrome_profile_' + process.env.DISPLAY.substr(1);
const myChromePreference_json = '{"download":{"default_directory":"' + myDownloadPathLocal + '","directory_upgrade":true},"savefile":{"default_directory":"' + myDownloadPathLocal + '"}}';
fs.existsSync(myChromeProfilePath) || fs.mkdirSync(myChromeProfilePath);
fs.existsSync(myChromeProfilePath + '/Default') || fs.mkdirSync(myChromeProfilePath + '/Default');
fs.writeFileSync(myChromeProfilePath + '/Default/Preferences', myChromePreference_json);
const myBrowserProxySetting = (process.env.http_proxy) ? "--proxy-server=" + process.env.http_proxy : "--no-proxy-server";

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
  offline: false,
  showXolvioMessages: true,
  'fail-when-no-tests-run': false,

  // - - - - CUCUMBER - - - -
  path: 'features',
  require: myCombinedStepPath,
  format: 'pretty',
  tags: '~@ignore',
  singleSnippetPerFile: true,
  recommendedFilenameSeparator: '_',
  chai: false,
  // screenshotsOnError: (0, _ci.isCI)(),
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: true,
  // Note: With a large viewport size and captureAllStepScreenshots enabled,
  // you may run out of memory. Use browser.setViewportSize to make the
  // viewport size smaller.
  saveScreenshotsToReport: false,
  jsonOutput: null,
  // compiler: 'js:' + path.resolve(myChimpDir, './dist/lib/babel-register.js'),
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'chrome',
  platform: 'linux',
  seleniumStandaloneOptions: {
    version: _selenium_standalone.version,
    drivers: _selenium_standalone.drivers,
    baseURL: _selenium_standalone.baseURL
  },
  
  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    desiredCapabilities: {
      browserName: 'chrome',
      initialBrowserUrl: "about:blank",
      chromeOptions: {
        // binary: '/usr/bin/google-chrome',
        args: [
                "--disable-infobars",
                "--no-first-run",
                "--window-size=" + myDISPLAYSIZE.replace('x',','),
                "--user-data-dir=/tmp/chrome_profile_" + process.env.DISPLAY.substr(1),
                "--bypass-app-banner-engagement-checks",
                myBrowserProxySetting
              ],
        prefs: {
          'credentials_enable_service': false,
          'profile': {
            'password_manager_enabled': false
          }
        }
      }
    },
    host: 'localhost',
    port: null,
    path: '/wd/hub',
    baseUrl: null,
    coloredLogs: true,
    screenshotPath: null,
    waitforTimeout: 500,
    waitforInterval: 250
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
  mochaCommandLineOptions: {bail: true},
  mochaConfig: {
    // tags and grep only work when watch mode is false
    tags: '',
    grep: null,
    timeout: 60000,
    reporter: 'spec',
    slow: 10000,
    useColors: true
  },

  // - - - - JASMINE  - - - -
  jasmine: false,
  jasmineConfig: {
    specDir: '.',
    specFiles: [
      '**/*@(_spec|-spec|Spec).@(js|jsx)',
    ],
    helpers: [
      'support/**/*.@(js|jsx)',
    ],
    stopSpecOnExpectationFailure: false,
    random: false,
  },
  jasmineReporterConfig: {
    // This options are passed to jasmine.configureDefaultReporter(...)
    // See: http://jasmine.github.io/2.4/node.html#section-Reporters
  },

  // - - - - METEOR  - - - -
  ddp: false,
  serverExecuteTimeout: 10000,

  // - - - - PHANTOM  - - - -
  phantom_w: 1280,
  phantom_h: 1024,
  phantom_ignoreSSLErrors: false,

  // - - - - DEBUGGING  - - - -
  log: 'info',
  debug: false,
  seleniumDebug: null,
  debugCucumber: null,
  debugBrkCucumber: null,
  debugMocha: null,
  debugBrkMocha: null,
};

