const FrameworkPath = process.env.FrameworkPath;
var cucumberJsReporter = require('wdio-cucumberjs-json-reporter').default;
const framework_libs = require(FrameworkPath + '/framework/libs/framework_libs');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const safexvfb = require(FrameworkPath + '/framework/libs/safexvfb');
const changeBrowserZoom = require(FrameworkPath + '/framework/functions/action/changeBrowserZoom');
var currentScenarioName, currentScenarioStatus;
var currentStepNumber;

const frameworkHooks = {
  /**
   *  wdio runner before hooks
   **/

  /**
   * Gets executed once before all workers get launched.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */
  onPrepare: function (config, capabilities) {
  },
  /**
   * Gets executed before a worker process is spawned and can be used to initialise specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {String} cid      capability id (e.g 0-0)
   * @param  {[type]} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {[type]} specs    specs to be run in the worker process
   * @param  {[type]} args     object that will be merged with the main configuration once worker is initialised
   * @param  {[type]} execArgv list of string arguments passed to the worker process
   */
  onWorkerStart: function (cid, caps, specs, args, execArgv) {
  },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  beforeSession: function (config, capabilities, specs) {
    // const myDisplayNum = safexvfb.start();
    // process.env.DISPLAY = `:${myDisplayNum}`;
  },
  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   */
  before: function (capabilities, specs) {
  },
  /**
   * Hook that gets executed before the suite starts
   * @param {Object} suite suite details
   */
  beforeSuite: function (suite) {
  },
  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   * stepData and world are Cucumber framework specific
   */
  beforeHook: function (test, context/*, stepData, world*/) {
  },
  /**
   * Hook that gets executed _after_ a hook within the suite ends (e.g. runs after calling
   * afterEach in Mocha)
   * stepData and world are Cucumber framework specific
   */
  afterHook: function (test, context, { error, result, duration, passed, retries }/*, stepData, world*/) {
  },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */
  beforeTest: function (test, context) {
  },
  
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {String} commandName command name
   * @param {Array} args arguments that command would receive
   */
  beforeCommand: function (commandName, args) {
  },

  /**
   * cucumber framework hooks
   **/ 

   BeforeFeature: function(feature) {
    console.log(`Feature: ${feature.document.feature.name}\n`);
    currentScenarioName = '';
    currentStepNumber = 0;
    // start RDP and sshfs
    if (process.env.SSHHOST && process.env.SSHPORT) {
      // these start functions will prevent double running
      framework_libs.startSshFs();
      if (process.env.MOVIE == 1 || process.env.SCREENSHOT >= 1) {
        framework_libs.startRdesktop();
        var targetDesktopImage;
        switch (process.env.PLATFORM) {
          case 'Win10':
            targetDesktopImage = FrameworkPath + '/framework/support/images/windows10_startButton.png';
            break;
          case 'Win7':
            targetDesktopImage = FrameworkPath + '/framework/support/images/windows10_startButton.png';
            break;
        }
        try {
          var imageSimilarity = process.env.imageSimilarity;
          var imageWaitTime = 10;
          screen_session.screenWaitImage(targetDesktopImage, imageSimilarity, null, imageWaitTime);
          console.log('can see desktop');
        } catch(e) {
          console.log('cannot see desktop');
        }
        // browser.pause(5000);
      }
    }
  },

  BeforeScenario: function(scenario) {
    console.log(`Scenario: ${scenario.name}\n`);
    const scenarioName = scenario.name;
    currentScenarioName = scenarioName;
    currentStepNumber = 0;
    browser.windowHandleMaximize();
    // browser.setTimeouts(implicit, pageLoad, script)
    browser.setTimeouts(null, null, 3600*1000);
  },

  BeforeStep: function(step) {
    // console.log(step);
    // only count real steps (do not count After steps)
    if (step.text.length > 0) currentStepNumber++;
  },

  AfterStep: function(step, passed) {
    // to be done for real steps
    if (step.text.length > 0) {
      // start recording
      if (process.env.MOVIE == 1 && currentStepNumber == 1) framework_libs.startRecording(currentScenarioName);

      // prepare display text
      const currentScenarioNameArray = currentScenarioName.split(' ');
      const remarkScenarioName = (currentScenarioNameArray.length <= 10) ? currentScenarioName : currentScenarioNameArray.slice(0, 6).join(' ') +
                                 ' .. ' +
                                 currentScenarioNameArray.slice(currentScenarioNameArray.length - 3).join(' ');
      const remarkStepName = step.text;
      const remarkTextBase = `${remarkScenarioName} ... Step ${currentStepNumber} : ${remarkStepName}`;
      var remarkText, remarkColor;
      if (passed) {
          remarkText = remarkTextBase;
          remarkColor = 'green';
      } else {
          remarkText = `Step Failed: ${remarkTextBase}`;
          remarkColor = 'red';
      }

      // in the case of SCREENREMARK=0 do not print remark text
      if (process.env.SCREENREMARK == 0) remarkText = '';
      
      // start screenshot
      if (process.env.SCREENSHOT == 2 && currentStepNumber == 1) {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }
      if (process.env.SCREENSHOT == 3) {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }

      // show browser log
      if (process.env.BROWSERLOG == 1) {
        browser_session.showErrorLog(browser);
      }
    }
  },

  AfterScenario: function(scenario, result) {
    
    // scenario status
    if (result.status == 'passed') {
      currentScenarioStatus = 'Passed';
    } else {
      currentScenarioStatus = 'Failed'
      console.log('browser error log:');
      browser_session.showErrorLog(browser);
    }
    const remarkText = (process.env.SCREENREMARK == 0) ? '' : `Scenario ${currentScenarioStatus}: ${currentScenarioName}`;
    const remarkColor = (currentScenarioStatus == 'Passed') ? 'green' : 'red';

    // final screenshot and end movie with it
    if (process.env.SCREENSHOT >= 1) {
      framework_libs.takeScreenshot(currentScenarioName, currentScenarioStatus, currentStepNumber, remarkText, remarkColor, 30);
    }
    if (process.env.MOVIE == 1) {
      framework_libs.stopRecording(currentScenarioName);
    }
    if (process.env.MOVIE == 1) {
      framework_libs.renameRecording(currentScenarioName, currentScenarioStatus, currentStepNumber);
    }

    // process tags for report attachement
    var scenarioBeginImage_tag, scenarioEndImage_tag, video_tag, runlog_tag;
    scenarioBeginImage_tag = framework_libs.getHtmlReportTags(currentScenarioName, 'Step', 1)[0];
    [scenarioEndImage_tag, video_tag, runlog_tag] = framework_libs.getHtmlReportTags(currentScenarioName, currentScenarioStatus, currentStepNumber);
    cucumberJsReporter.attach(runlog_tag, 'text/html');
    if (process.env.MOVIE == 1) { // MOVIE == 1 attach movie
      cucumberJsReporter.attach(video_tag, 'text/html');
    }
  
    if (process.env.SCREENSHOT == 1) { // SCREESHOT == 1 attach final screenshot
      cucumberJsReporter.attach(scenarioEndImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 2) { // SCREESHOT == 2 attach first and final screenshots
      cucumberJsReporter.attach(scenarioBeginImage_tag, 'text/html');
      cucumberJsReporter.attach(scenarioEndImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 3) { // SCREESHOT == 3 attach all step screenshots, skipped steps will get empty refernce
      for (stepIndex = 1; stepIndex <= currentStepNumber; stepIndex++) {
        const stepImage_tag = framework_libs.getHtmlReportTags(currentScenarioName, 'Step', stepIndex)[0];
        cucumberJsReporter.attach(stepImage_tag, 'text/html');
      }
      cucumberJsReporter.attach(scenarioEndImage_tag, 'text/html');
    }


    // need to perform these steps before tear down RDP
    changeBrowserZoom(100);

    // need this pause for screenshots rename procss to finish
    browser.pause(1000);
  },
  
  AfterFeature: function(feature) {
    if (process.env.SSHHOST && process.env.SSHPORT) {
      try {
        framework_libs.stopRdesktop();
        framework_libs.stopSshFs();
        framework_libs.stopSshTunnel();
      } catch(e) {}
    }
  },

  /**
   *  wdio runner after hooks
   **/

  /**
   * Runs after a WebdriverIO command gets executed.
   * @param {String} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {Number} result 0 - command success, 1 - command error
   * @param {Object} error error object if any
   */
  afterCommand: function (commandName, args, result, error) {
  },
  /**
   * Function to be executed after a test (in Mocha/Jasmine) ends.
   */
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
  },
  /**
   * Hook that gets executed after the suite has ended
   * @param {Object} suite suite details
   */
  afterSuite: function (suite) {
  },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {Number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  after: function (result, capabilities, specs) {
  },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  afterSession: function (config, capabilities, specs) {
    // const myDisplayNum = process.env.DISPLAY.substring(1);
    // safexvfb.stop(myDisplayNum);
    // process.env.DISPLAY = null;
  },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {Object} exitCode 0 - success, 1 - fail
   * @param {Object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  onComplete: function (exitCode, config, capabilities, results) {
  },
  /**
  * Gets executed when a refresh happens.
  * @param {String} oldSessionId session ID of the old session
  * @param {String} newSessionId session ID of the new session
  */
  onReload: function(oldSessionId, newSessionId) {
  },
}

module.exports = frameworkHooks;
