const FrameworkPath = process.env.FrameworkPath;
const framework_libs = require(FrameworkPath + '/framework/libs/framework_libs');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const browser_session = require(FrameworkPath + '/framework/libs/browser_session');
const changeBrowserZoom = require(FrameworkPath + '/framework/functions/action/changeBrowserZoom');
var currentScenarioName, currentScenarioStatus;
var currentStepNumber;

const frameworkHooks = {
  BeforeFeature: function(feature) {
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
    var scenarioName = scenario.getName();
    currentScenarioName = scenarioName;
    currentStepNumber = 0;
    browser.windowHandleMaximize();
    browser.timeouts('script', 3600*1000);
  },

  BeforeStep: function(step) {
    // only count real steps (do not count After steps)
    if(step.getName()) currentStepNumber++;
  },

  AfterStep: function(step, result) {
    if (step.getName()) {
      // to be done for real steps
      const remarkScenarioName = (currentScenarioName.length <= 40) ? currentScenarioName : currentScenarioName.slice(0, 30) + '...' +
                                                                                     currentScenarioName.slice(currentScenarioName.length - 10,
                                                                                                               currentScenarioName.length);
      const remarkStepName = step.getName();
      const remarkTextBase = `${remarkScenarioName}... Step ${currentStepNumber} : ${remarkStepName}`;
      var remarkText, remarkColor;
      switch (result) {
        case 'passed':
          remarkText = remarkTextBase;
          remarkColor = 'green';
          break;
        case 'failed':
          remarkText = `Step Failed: ${remarkTextBase}`;
          remarkColor = 'red';
          break;
        case 'undefined':
          remarkText = `Step Undefined: ${remarkTextBase}`;
          remarkColor = 'orange';
          break;
        case 'skipped':
          remarkText = `Step Undefined: ${remarkTextBase}`;
          remarkColor = 'blue';
          break;  
      }
      if (process.env.SCREENREMARK == 0) remarkText = '';
      // start recording
      if (process.env.MOVIE == 1 && currentStepNumber == 1) framework_libs.startRecording(currentScenarioName);
      // start screenshot
      if ((process.env.SCREENSHOT == 2) && currentStepNumber == 1) {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }
      if (result != 'skipped' && process.env.SCREENSHOT == 3) {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }
      if (process.env.BROWSERLOG == 1) {
        browser_session.showErrorLog(browser);
      }  
    }
  },

  AfterScenario: function(scenario) {
    // NOTE: AfterScenario gets run after everyting ends, so do not use it to control recording.
    // var scenarioName = scenario.getName();
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

  // expect scenario.isSuccessful(), should be called with After(scenario)
  AfterScenarioResult: function(scenario) {
    var scenarioName = scenario.getName();
    var stepOneImage_tag, lastRunStepImage_tag, video_tag, runlog_tag;
    if (process.env.MOVIE == 1) {
      framework_libs.stopRecording(scenarioName);
    }
    stepOneImage_tag = framework_libs.getHtmlReportTags(scenarioName, 'Step', '1')[0];
    if (scenario.isSuccessful()) {
      currentScenarioStatus = 'Passed';
    } else {
      currentScenarioStatus = 'Failed'
      console.log('browser error log:');
      browser_session.showErrorLog(browser);
    }

    const remarkText = (process.env.SCREENREMARK == 0) ? '' : `Scenario ${currentScenarioStatus}: ${currentScenarioName}`;
    const remarkColor = (currentScenarioStatus == 'Failed') ? 'red' : 'green';
    if (process.env.MOVIE == 1) {
      framework_libs.takeScreenshot(scenarioName, currentScenarioStatus, currentStepNumber, remarkText, remarkColor, 30);
      framework_libs.renameRecording(scenarioName, currentScenarioStatus, currentStepNumber);
    } else if (process.env.SCREENSHOT >= 1) {
      framework_libs.takeScreenshot(scenarioName, currentScenarioStatus, currentStepNumber, remarkText, remarkColor, 30);
    }
    [lastRunStepImage_tag, video_tag, runlog_tag] = framework_libs.getHtmlReportTags(scenarioName, currentScenarioStatus, currentStepNumber);

    scenario.attach(runlog_tag, 'text/html');
    if (process.env.MOVIE == 1) {
      scenario.attach(video_tag, 'text/html');
    }
    if (process.env.SCREENSHOT == 1) {
      scenario.attach(lastRunStepImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 2) {
      scenario.attach(stepOneImage_tag, 'text/html');
      scenario.attach(lastRunStepImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 3) {
      for (stepIndex = 1; stepIndex <= currentStepNumber; stepIndex++) {
        const stepImage_tag = framework_libs.getHtmlReportTags(scenarioName, 'Step', stepIndex)[0];
        scenario.attach(stepImage_tag, 'text/html');
      }
    }
    
    // need to perform these steps before tear down RDP
    changeBrowserZoom(100);

    // need this pause for screenshots to be renamed
    browser.pause(1000);
  },
}

module.exports = frameworkHooks;
