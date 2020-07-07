'use strict';
const FrameworkPath = process.env.FrameworkPath;
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const fs = require('fs');
const selenium_standalone_config = require(FrameworkPath + '/framework/configs/selenium-standalone_config.js');
const myCombinedStepPath = [`${FrameworkPath}/framework/support/steps/**/*.js`,
                            `${ProjectPath}/${TestDir}/support/steps/**/*.js`,
                            `support/steps/*.js`];
const myDownloadPathLocal = process.env.DownloadPathLocal || '/tmp/download_' + process.env.DISPLAY.substr(1);

// for Linux chrome
const myChromeProfilePath = process.env.myChromeProfilePath || '/tmp/chrome_profile_' + process.env.DISPLAY.substr(1);
fs.existsSync(myChromeProfilePath) || fs.mkdirSync(myChromeProfilePath);
// const myBrowserProxySetting = (process.env.http_proxy) ? "--proxy-server=" + process.env.http_proxy : "--no-proxy-server";

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
  // server: false,
  // serverPort: 8060,
  // serverHost: 'localhost',
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
  chai: false,
  screenshotsOnError: false,
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: false,
  jsonOutput: null,
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'chrome',
  platform: 'linux',
  host: 'localhost',
  port: process.env.LOCALSELPORT,
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
        // binary: '/usr/bin/chromium-browser',
        args: [
          "--disable-infobars",
          "--no-first-run",
          "--bypass-app-banner-engagement-checks",
          // "--disable-gpu",
          // "--no-sandbox",
          "--enable-background-networking",
          "--start-maximized ",
          "--window-size=" + myDISPLAYSIZE.replace('x', ','),
          "--user-data-dir=" + myChromeProfilePath,
          "--incognito",
          // "--excludeSwitches",
          // "--enable-automation",
          // myBrowserProxySetting
        ],
        prefs: {
          'credentials_enable_service': false,
          'profile': {
            'password_manager_enabled': false
          },
          'download': {
            'default_directory': myDownloadPathLocal,
            'directory_upgrade': true
          },
          'savefile': {
            'default_directory': myDownloadPathLocal
          }
        }
      }
    },
    baseUrl: 'chrome:version',
    logLevel: 'silent',
    deprecationWarnings: false,
    coloredLogs: false,
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

