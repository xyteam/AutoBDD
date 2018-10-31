'use strict';
const myFrameworkPath = process.env.FrameworkPath;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _path = require('path');
const _path2 = _interopRequireDefault(_path);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; };
const _selenium_standalone = require(myFrameworkPath + '/global/configs/selenium-standalone_config.js');
const myGlobalStepPath = myFrameworkPath + '/global/step_definitions';
const myCombinedStepPath = fs.existsSync('../step_definitions') ? ['./features', '../step_definitions', myGlobalStepPath] : ['./features', myGlobalStepPath];

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
  // Note: With a large viewport size and captureAllStepScreenshots enabled,
  // you may run out of memory. Use browser.setViewportSize to make the
  // viewport size smaller.
  saveScreenshotsToReport: false,
  jsonOutput: null,
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'chrome',
  platform: 'linux',
  name: '',
  user: '',
  key: '',
  host: 'localhost',
  port: process.env.LOCALSELPORT,
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
    port: process.env.LOCALSELPORT,
    path: '/wd/hub',
    baseUrl: null,
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

