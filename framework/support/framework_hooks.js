const frameworkPath = process.env.FrameworkPath;
const execSync = require('child_process').execSync;
const framework_libs = require(frameworkPath + '/framework/libs/framework_libs');
const screen_session = require(frameworkPath + '/framework/libs/screen_session');

module.exports = {
  BeforeFeature: function (event) {
    // start RDP and sshfs
    if (process.env.SSHHOST && process.env.SSHPORT) {
      // these start functions will prevent double running
      framework_libs.startSshFs();
      if (process.env.MOVIE == 1 || process.env.SCREENSHOT == 1) {
        framework_libs.startRdesktop();
        var targetDesktopImage;
        switch (process.env.PLATFORM) {
          case 'Win10':
            targetDesktopImage = frameworkPath + '/framework/support/framework_images/windows10_startButton.png';
            break;
          case 'Win7':
            targetDesktopImage = frameworkPath + '/framework/support/framework_images/windows10_startButton.png';
            break;
        }
        try {
          var imageSimilarity = process.env.imageSimilarity;
          var imageWaitTime = 10;
          screen_session.screenWaitImage(targetDesktopImage, imageSimilarity, imageWaitTime);
          console.log('can see desktop');
        } catch(e) {
          console.log('cannot see desktop');
        }
        // browser.pause(5000);
      }
    }
  },

  Before: function(scenario) {
    // capture and maxmize the browser window
    var windowHandle = browser.windowHandle();
    browser.window(windowHandle.value);
    // browser.windowHandleMaximize();
    // reset browser zoom
    screen_session.keyTap('0', 'control');
    browser.pause(1000);
  },

  BeforeScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    var scenarioName = scenario.getName();

    // increase IE browser script execution time
    if (process.env.BROWSER == 'IE') browser.timeouts('script', 60000);
    if (process.env.MOVIE == 1) framework_libs.startRecording(scenarioName);
  },

  BeforeStep: function(event) {
    var step = event.getPayloadItem('step');
    var stepName = step.getName();
  },

  AfterStep: function(event) {
    var step = event.getPayloadItem('step');
    var stepName = step.getName();
  },

  // this AfterScenario has scenario info but without result. Use After below if you need result
  AfterScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    var scenarioName = scenario.getName();
  },

  After: function(scenario) {
    var scenarioName = scenario.getName();

    if (process.env.MOVIE == 1) {
      framework_libs.takeScreenshot(scenarioName);
      framework_libs.stopRecording(scenarioName);
    } else if (process.env.SCREENSHOT == 1) {
      framework_libs.takeScreenshot(scenarioName);
    }
    
    var image_tag, video_tag;
    if (scenario.isSuccessful()) {
      framework_libs.renamePassedFailed(scenarioName, 'Passed');
      [image_tag, video_tag] = framework_libs.getHtmlReportTags(scenarioName, 'Passed');
    } else {
      framework_libs.renamePassedFailed(scenarioName, 'Failed');
      [image_tag, video_tag] = framework_libs.getHtmlReportTags(scenarioName, 'Failed');
    }

    if (process.env.MOVIE == 1) {
      scenario.attach(video_tag, 'text/html');
    } else if (process.env.SCREENSHOT == 1) {
      scenario.attach(image_tag, 'text/html');
    }
    
    // need to perform these steps before tear down RDP
    screen_session.keyTap('0', 'control');
    browser.pause(1000);
  },

  AfterFeature: function (event) {
    browser.end();
    if (process.env.SSHHOST && process.env.SSHPORT) {
      try {
        if (process.env.MOVIE == 1 || process.env.SCREENSHOT == 1) framework_libs.stopRdesktop();
        framework_libs.stopSshFs();
        framework_libs.stopSshTunnel();
      } catch(e) {}
    }
  }
}