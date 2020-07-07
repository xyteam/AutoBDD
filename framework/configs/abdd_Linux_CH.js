const FrameworkPath = process.env.FrameworkPath;
const ProjectPath = process.env.PROJECTRUNPATH;
const TestDir = process.env.TestDir;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const myREPORTDIR = process.env.REPORTDIR || '.';
const fs = require('fs');
const path = require('path');
const { hooks } = require(`${FrameworkPath}/framework/support/module_hooks.js`);
const selenium_standalone_config = require(FrameworkPath + '/framework/configs/selenium-standalone_config.js');
const myCombinedStepPath = [`${FrameworkPath}/framework/support/steps/**/*.js`,
                            `${ProjectPath}/${TestDir}/support/steps/**/*.js`,
                            `support/steps/*.js`];
const myDownloadPathLocal = process.env.DownloadPathLocal || '/tmp/download_' + process.env.DISPLAY.substr(1);
const myParallelRunPort = 4444 + parseInt(process.env.DISPLAY.slice(-3).replace(':', ''));

// for Linux chrome
const myChromeProfilePath = process.env.myChromeProfilePath || '/tmp/chrome_profile_' + process.env.DISPLAY.substr(1);
fs.existsSync(myChromeProfilePath) || fs.mkdirSync(myChromeProfilePath);
const myPreference_json = `{"download":{"default_directory":"${myDownloadPathLocal}","directory_upgrade":true},"savefile":{"default_directory":"${myDownloadPathLocal}"}}`;
fs.existsSync(myChromeProfilePath) || fs.mkdirSync(myChromeProfilePath);
fs.existsSync(myChromeProfilePath + '/Default') || fs.mkdirSync(myChromeProfilePath + '/Default');
fs.writeFileSync(myChromeProfilePath + '/Default/Preferences', myPreference_json);
process.env.debugX = process.env.debugX || 1;

// const myBrowserProxySetting = (process.env.http_proxy) ? "--proxy-server=" + process.env.http_proxy : "--no-proxy-server";

exports.config = {
    // we are not using selenium-standalone
    // seleniumStandaloneOptions: {
    //   version: selenium_standalone_config.version,
    //   drivers: selenium_standalone_config.drivers,
    //   baseURL: selenium_standalone_config.baseURL,
    //   sessionTimeout: 4000 // more than 1 hour
    // },

    //
    // ====================
    // Runner Configuration
    // ====================
    //
    // WebdriverIO allows it to run your tests in arbitrary locations (e.g. locally or
    // on a remote machine).
    runner: 'local',
    //
    // ==================
    // Specify Test Files
    // ==================
    // Define which test specs should run. The pattern is relative to the directory
    // from which `wdio` was called. Notice that, if you are calling `wdio` from an
    // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
    // directory is where your package.json resides, so `wdio` will be called from there.
    //
    specs: [
        './features/**/*.feature',
    ],
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    //
    // ============
    // Capabilities
    // ============
    // Define your capabilities here. WebdriverIO can run multiple capabilities at the same
    // time. Depending on the number of capabilities, WebdriverIO launches several test
    // sessions. Within your capabilities you can overwrite the spec and exclude options in
    // order to group specific specs to a specific capability.
    //
    // First, you can define how many instances should be started at the same time. Let's
    // say you have 3 different capabilities (Chrome, Firefox, and Safari) and you have
    // set maxInstances to 1; wdio will spawn 3 processes. Therefore, if you have 10 spec
    // files and you set maxInstances to 10, all spec files will get tested at the same time
    // and 30 processes will get spawned. The property handles how many capabilities
    // from the same test should run tests.
    //
    maxInstances: 1,
    //
    // If you have trouble getting all important capabilities together, check out the
    // Sauce Labs platform configurator - a great tool to configure your capabilities:
    // https://docs.saucelabs.com/reference/platforms-configurator
    //
    capabilities: [
      {
        // maxInstances can get overwritten per capability. So if you have an in-house Selenium
        // grid with only 5 firefox instances available you can make sure that not more than
        // 5 instances get started at a time.
        maxInstances: 1,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                // '--headless',
                // '--display=' + process.env.DISPLAY,
                '--disable-infobars',
                "--window-size=" + myDISPLAYSIZE.replace('x', ','),
                // "--start-maximized",
                // '--window-size=1920,1200',
                "--user-data-dir=" + myChromeProfilePath,      
                "--incognito",
                '--no-sandbox',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--ignore-certificate-errors'
            ],
            // prefs: {
            //   'credentials_enable_service': false,
            //   'profile': {
            //     'password_manager_enabled': false
            //   },
            //   'download': {
            //     'default_directory': myDownloadPathLocal,
            //     'directory_upgrade': true
            //   },
            //   'savefile': {
            //     'default_directory': myDownloadPathLocal
            //   }
            // }
        },
        port: myParallelRunPort
      }
    ],
    //
    // ===================
    // Test Configurations
    // ===================
    // Define all options that are relevant for the WebdriverIO instance here
    //
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    logLevel: 'trace',
    //
    // If outputDir is provided WebdriverIO can capture driver session logs
    // it is possible to configure which logTypes to include/exclude.
    // excludeDriverLogs: ['*'], // pass '*' to exclude all driver session logs
    // excludeDriverLogs: ['bugreport', 'server'],
    outputDir: path.join(__dirname, '/logs'),
    //
    // Set specific log levels per logger
    // loggers:
    // - webdriver, webdriverio
    // - @wdio/applitools-service, @wdio/browserstack-service,
    //   @wdio/devtools-service, @wdio/sauce-service
    // - @wdio/mocha-framework, @wdio/jasmine-framework
    // - @wdio/local-runner, @wdio/lambda-runner
    // - @wdio/sumologic-reporter
    // - @wdio/cli, @wdio/config, @wdio/sync, @wdio/utils
    // Level of logging verbosity: trace | debug | info | warn | error | silent
    // logLevels: {
    //     webdriver: 'info',
    //     '@wdio/applitools-service': 'info'
    // },
    //
    // If you only want to run your tests until a specific amount of tests have failed use
    // bail (default is 0 - don't bail, run all tests).
    bail: 0,
    //
    // Set a base URL in order to shorten url command calls. If your `url` parameter starts
    // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
    // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
    // gets prepended directly.
    baseUrl: 'chrome:version',
    //
    // Default timeout for all waitFor* commands.
    waitforTimeout: 10000,
    //
    // Default timeout in milliseconds for request
    // if browser driver or grid doesn't send response
    connectionRetryTimeout: 90000,
    //
    // Default request retries count
    connectionRetryCount: 3,
    //
    // Test runner services
    // Services take over a specific job you don't want to take care of. They enhance
    // your test setup with almost no effort. Unlike plugins, they don't add new
    // commands. Instead, they hook themselves up into the test process.
    services: [
        ['selenium-standalone', {
            logPath: 'logs',
            installArgs: {
                drivers: selenium_standalone_config.drivers,
            },
            args: {
                drivers: selenium_standalone_config.drivers,
                seleniumArgs: ['-host', '127.0.0.1','-port', `${myParallelRunPort}`]
            },
        }]
    ],
    //
    // Framework you want to run your specs with.
    // The following are supported: Mocha, Jasmine, and Cucumber
    // see also: https://webdriver.io/docs/frameworks.html
    //
    // Make sure you have the wdio adapter package for the specific framework installed
    // before running any tests.
    framework: 'cucumber',
    //
    // The number of times to retry the entire specfile when it fails as a whole
    // specFileRetries: 1,
    //
    // Whether or not retried specfiles should be retried immediately or deferred
    // to the end of the queue specFileRetriesDeferred: false,
    //
    // Test reporter for stdout.
    // The only one supported by default is 'dot'
    // see also: https://webdriver.io/docs/dot-reporter.html
    reporters: ['spec',
                [ 'cucumberjs-json', {
                    jsonFolder: `${myREPORTDIR}/.tmp`,
                    language: 'en'}
                ]
    ],
    //
    // If you are using Cucumber you need to specify the location of your step definitions.
    cucumberOpts: {
        // <boolean> show full backtrace for errors
        backtrace: false,
        // <string[]> module used for processing required features
        requireModule: ['@babel/register'],
        // <boolean> Treat ambiguous definitions as errors
        failAmbiguousDefinitions: true,
        // <boolean> invoke formatters without executing steps
        // dryRun: false,
        // <boolean> abort the run on first failure
        failFast: false,
        // <boolean> Enable this config to treat undefined definitions as
        // warnings
        ignoreUndefinedDefinitions: false,
        // <string[]> ("extension:module") require files with the given
        // EXTENSION after requiring MODULE (repeatable)
        name: [],
        // <boolean> hide step definition snippets for pending steps
        snippets: true,
        // <boolean> hide source uris
        source: true,
        // <string[]> (name) specify the profile to use
        profile: [],
        // <string[]> (file/dir) require files before executing features
        require: myCombinedStepPath,
        // <string> specify a custom snippet syntax
        snippetSyntax: undefined,
        // <boolean> fail if there are any undefined or pending steps
        strict: true,
        // <string> (expression) only execute the features or scenarios with
        // tags matching the expression, see
        // https://docs.cucumber.io/tag-expressions/
        tagExpression: 'not @Pending',
        // <boolean> add cucumber tags to feature or scenario name
        tagsInTitle: false,
        // <number> timeout for step definitions
        timeout: 60*1000*process.env.debugX,
    },
    // automationProtocol: 'devtools',
    ...hooks,
};

