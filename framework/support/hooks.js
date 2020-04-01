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
    // to be done for real steps
    if (step.getName()) {
      // start recording
      if (process.env.MOVIE == 1 && currentStepNumber == 1) framework_libs.startRecording(currentScenarioName);

      // prepare display text
      const currentScenarioNameArray = currentScenarioName.split(' ');
      const remarkScenarioName = (currentScenarioNameArray.length <= 10) ? currentScenarioName : currentScenarioNameArray.slice(0, 6).join(' ') +
                                 ' .. ' +
                                 currentScenarioNameArray.slice(currentScenarioNameArray.length - 3).join(' ');
      const remarkStepName = step.getName();
      const remarkTextBase = `${remarkScenarioName} ... Step ${currentStepNumber} : ${remarkStepName}`;
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
          remarkText = `Step Skipped: ${remarkTextBase}`;
          remarkColor = 'blue';
          break;  
      }

      // in the case of SCREENREMARK=0 do not print remark text
      if (process.env.SCREENREMARK == 0) remarkText = '';
      
      // start screenshot
      if (process.env.SCREENSHOT == 2 && currentStepNumber == 1) {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }
      if (process.env.SCREENSHOT == 3 && result != 'skipped') {
        framework_libs.takeScreenshot(currentScenarioName, 'Step', currentStepNumber, remarkText, remarkColor, 20);
      }

      // show browser log
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
    // scenario status
    if (scenario.isSuccessful()) {
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
    scenario.attach(runlog_tag, 'text/html');
    
    if (process.env.MOVIE == 1) { // MOVIE == 1 attach movie
      scenario.attach(video_tag, 'text/html');
    }
    
    if (process.env.SCREENSHOT == 1) { // SCREESHOT == 1 attach final screenshot
      scenario.attach(scenarioEndImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 2) { // SCREESHOT == 2 attach first and final screenshots
      scenario.attach(scenarioBeginImage_tag, 'text/html');
      scenario.attach(scenarioEndImage_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 3) { // SCREESHOT == 3 attach all step screenshots, skipped steps will get empty refernce
      for (stepIndex = 1; stepIndex <= currentStepNumber; stepIndex++) {
        const stepImage_tag = framework_libs.getHtmlReportTags(currentScenarioName, 'Step', stepIndex)[0];
        scenario.attach(stepImage_tag, 'text/html');
      }
      scenario.attach(scenarioEndImage_tag, 'text/html');
    }
    
    // need to perform these steps before tear down RDP
    changeBrowserZoom(100);

    // need this pause for screenshots rename procss to finish
    browser.pause(1000);
  },
}

module.exports = frameworkHooks;
