'use strict';
const frameworkPath = process.env.FrameworkPath;
const projectFullPath = process.env.FrameworkPath + '/test-projects/' + process.env.ThisProject; 
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const selenium_standalone_config = require(frameworkPath + '/framework/configs/selenium-standalone_config.js');
const myCombinedStepPath = ['features', projectFullPath + '/global'];

// for Linux chrome
const myDownloadPathLocal = process.env.DownloadPathLocal || '/tmp/download_' + process.env.DISPLAY.substr(1);
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
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: false,
  jsonOutput: null,
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'chrome',
  platform: 'linux',
  seleniumStandaloneOptions: {
    version: selenium_standalone_config.version,
    drivers: selenium_standalone_config.drivers,
    baseURL: selenium_standalone_config.baseURL
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
                "--no-sandbox",
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

