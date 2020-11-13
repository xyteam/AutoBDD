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

// for Linux firefox
const myProfilePath = process.env.myProfilePath || '/tmp/firefox_profile_' + process.env.DISPLAY.substr(1);
const myPreference_json = '{"download":{"default_directory":"' + myDownloadPathLocal + '","directory_upgrade":true},"savefile":{"default_directory":"' + myDownloadPathLocal + '"}}';
fs.existsSync(myProfilePath) || fs.mkdirSync(myProfilePath);
fs.existsSync(myProfilePath + '/Default') || fs.mkdirSync(myProfilePath + '/Default');
fs.writeFileSync(myProfilePath + '/Default/Preferences', myPreference_json);
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
  chai: false,
  screenshotsOnError: false,
  screenshotsPath: '.screenshots',
  captureAllStepScreenshots: false,
  saveScreenshotsToDisk: true,
  saveScreenshotsToReport: false,
  jsonOutput: null,
  conditionOutput: true,

  // - - - - SELENIUM-STANDALONE
  browser: 'firefox',
  platform: 'linux',
  seleniumStandaloneOptions: {
    version: selenium_standalone_config.version,
    drivers: selenium_standalone_config.drivers,
    baseURL: selenium_standalone_config.baseURL
  },
  
  // - - - - WEBDRIVER-IO  - - - -
  webdriverio: {
    desiredCapabilities: {
      browserName: 'firefox',
      initialBrowserUrl: "http://www.google.com",
      // firefoxOptions: {
      //   // binary: '/usr/bin/firefox',
      //   args: [
      //           "--private-window",
      //           "--sync",
      //           "--window-size=" + myDISPLAYSIZE.replace('x',','),
      //           "-P " + process.env.DISPLAY.substr(1),
      //           "--profile /tmp/firefox_profile_" + process.env.DISPLAY.substr(1),
      //           myBrowserProxySetting
      //         ],
      //   prefs: {
      //     'credentials_enable_service': false,
      //     'profile': {
      //       'password_manager_enabled': false
      //     }
      //   }
      // }
    },
    baseUrl: 'about:blank',
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

