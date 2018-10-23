const robot = require('robotjs');
const cmd = require('node-cmd');
const fs = require('fs');
const execSync = require('child_process').execSync;
const defaultCPM = 2400;
const myWorld = require(process.env.ProjectFullPath + '/global/support/world').World();
const robot_session = require(process.env.ProjectFullPath + '/global/libs/robot_session');
const xpath_lib = require(process.env.ProjectFullPath + '/global/libs/xpath_lib');
const header_xpath = xpath_lib.xpathRequire('header_xpath');
const footer_xpath = xpath_lib.xpathRequire('footer_xpath');
const content_xpath = xpath_lib.xpathRequire('content_xpath');
const version_xpath = header_xpath.SFPortalVersion_text;
const headerSection_xpath = header_xpath.headerSection;
const footerSection_xpath = footer_xpath.footerSection;
const myTestUrl = myWorld.test_url;
const myAPIUrl = myWorld.api_url;
const myHOME = process.env.HOME;
const myDISPLAY = process.env.DISPLAY;
const myPLATFORM = process.env.PLATFORM;
const myBROWSER = process.env.BROWSER;
const myRDPHOST = process.env.RDPHOST;
const myRDPPORT = process.env.RDPPORT;
const mySSHPORT = process.env.SSHPORT;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const myWATCH = process.env.WATCH;
const myMOVIE = process.env.MOVIE;
const mySCREENSHOT = process.env.SCREENSHOT;
const myREPORTDIR = process.env.REPORTDIR;
const myMODULEPATH = process.env.MODULEPATH;
const myProjectFullPath = process.env.ProjectFullPath;
const myDownloadPathLocal = '/tmp/download_' + myDISPLAY.substr(1);
const cmd_copy_AutomationKey = 'cp ' + myProjectFullPath + '/global/configs_encrypted/automation_id_rsa ' + myHOME + '/.ssh/automation_id_rsa; chmod 0600 ' + myHOME + '/.ssh/automation_id_rsa';
const cmd_umount = 'if mountpoint -q ' + myDownloadPathLocal + '; then fusermount -u ' + myDownloadPathLocal + '; fi';
const cmd_umount_try = 'fusermount -u ' + myDownloadPathLocal;

robot.setXDisplayName(myDISPLAY);
robot.setMouseDelay(50);
robot.setKeyboardDelay(50);

var spaceChar_regex = /\s+/g;
var specialChar_regex = /[\:\;\,\(\)\/\'\.\&\%\-\<\>]/g;

module.exports = {
  BeforeFeature: function (event) {
    fs.existsSync(myHOME + '/.ssh') || fs.mkdirSync(myHOME + '/.ssh');
    console.log(cmd_copy_AutomationKey);
    execSync(cmd_copy_AutomationKey);
    try {
      execSync(cmd_umount_try);
    } catch(e) {}
    fs.existsSync(myDownloadPathLocal) || fs.mkdirSync(myDownloadPathLocal);
  },

  Before: function(scenario) {
    // start RDP and sshfs
    var cmd_start_rdesktop = 'DISPLAY=' + myDISPLAY + ' ' + 'rdesktop -fa 15 -mE ' + myRDPHOST + ':' + myRDPPORT + ' -u IEUser -p Passw0rd! &';
    var cmd_sshfs_mount = 'sshfs -o uid=$(id -u),gid=$(id -g) -o IdentityFile=' + myHOME + '/.ssh/automation_id_rsa -o StrictHostKeyChecking=no -o nonempty -o port=' + mySSHPORT + ' IEUser@' + myRDPHOST + ':Downloads/ ' + myDownloadPathLocal;
    if (myRDPHOST && (myRDPHOST != 'localhost') && myRDPPORT && mySSHPORT) {
      execSync('echo "' + cmd_start_rdesktop + '" > /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock');
      execSync('if mountpoint -q ' + myDownloadPathLocal + '; then fusermount -u ' + myDownloadPathLocal + '; fi');
      execSync('mkdir -p ' + myDownloadPathLocal);
      console.log(cmd_sshfs_mount);
      execSync(cmd_sshfs_mount);
      cmd.run(cmd_start_rdesktop);
    }

    // capture and maxmize the browser window
    var windowHandle = browser.windowHandle();
    browser.window(windowHandle.value);
    if (myPLATFORM.startsWith('Win')) {
      browser.windowHandleMaximize();
    }
    // this if block is to skip this on fresh start
    if (browser.url && browser.getUrl().includes(myTestUrl)) {
      // keyTap to close any browser alert
      robot.keyTap('escape');
      browser.refresh();
      // close out extra browser tabs
      var browser_tabs = browser.getTabIds();
      browser.switchTab(browser_tabs[browser_tabs.length - 1]);
      while (browser_tabs.length > 1) {
        robot.keyTap('w', 'control');
        browser.pause(100);
        browser_tabs = browser.getTabIds();
        browser.switchTab(browser_tabs[browser_tabs.length - 1]);
      }
    }

    robot.keyTap('0', 'control');
    browser.pause(1000);
  },

  BeforeScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    var scenario_png = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.png';
    var scenario_mp4 = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.mp4';
    var cmd_start_recording = 'ffmpeg -y -s ' + myDISPLAYSIZE +' -f x11grab -an -nostdin -r 4 -i '
        + myDISPLAY
        + ' -filter:v "setpts=0.5*PTS" '
        + myREPORTDIR + '/Recording_' + scenario_mp4
        + ' 2> /dev/null &';

    if (process.env.BROWSER == 'IE11') {
      browser.timeouts('script', 60000);
    }

    if (myMOVIE == 1) {
      console.log(cmd_start_recording);
      cmd.run(cmd_start_recording);
    }
  },

  BeforeStep: function(event) {
    var step = event.getPayloadItem('step');
    try {
      if (browser.isVisible(header_xpath.recentlyView)) {
        browser.moveToObject(header_xpath.noWhere);
      }
    } catch(e) {}
  },

  AfterStep: function(event) {
    var step = event.getPayloadItem('step');
  },

  AfterScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    var scenario_png = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.png';
    var scenario_mp4 = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.mp4';
  },

  After: function(scenario) {
    var scenario_png = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.png';
    var scenario_mp4 = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.mp4';
    var cmd_end_recording = 'pkill -2 -f ffmpeg.*/Recording_' + scenario_mp4;
    var cmd_wait_recording_finish = 'while lsof ' + myREPORTDIR + '/Recording_' + scenario_mp4 + '; do sleep 0.5; done';
    var cmd_take_screenshot = 'import -display ' + myDISPLAY + ' -window root '
        + myREPORTDIR + '/Captured_' + scenario_png;
    var cmd_stop_rdesktop = 'pkill -f "rdesktop.*' + myRDPHOST + ':' + myRDPPORT + '"';
    var cmd_rename_passed_screenshot = 'mv ' + myREPORTDIR + '/Captured_' + scenario_png
        + ' ' + myREPORTDIR + '/Passed_' + scenario_png;
    var cmd_rename_failed_screenshot = 'mv ' + myREPORTDIR + '/Captured_' + scenario_png
        + ' ' + myREPORTDIR + '/Failed_' + scenario_png;
    var cmd_rename_passed_recording = 'mv ' + myREPORTDIR + '/Recording_' + scenario_mp4
          + ' ' + myREPORTDIR + '/Passed_' + scenario_mp4;
    var cmd_rename_failed_recording = 'mv ' + myREPORTDIR + '/Recording_' + scenario_mp4
          + ' ' + myREPORTDIR + '/Failed_' + scenario_mp4;

    if (myMOVIE == 1) {
      try {
        execSync(cmd_end_recording);
      } catch(e) {}
    }

    if (mySCREENSHOT == 1 || myMOVIE == 1) {
      if (browser.isExisting(headerSection_xpath)) {
        try {
          browser.getLocationInView(headerSection_xpath);
          var headerVisible = browser.isVisibleWithinViewport(headerSection_xpath);
          var footerVisible = browser.isVisibleWithinViewport(footerSection_xpath);
          var numTry = 6;
          // new_size number will switch larger if the actual size shrinks passed the display limit
          console.log(headerVisible + ':' + footerVisible + ':' + numTry);
          while ( browser.getUrl().includes(myTestUrl) && !(headerVisible && footerVisible) && numTry >= 0 ) {
            numTry--;
            robot.keyTap('-', 'control');
            browser.pause(1000);
            headerVisible = browser.isVisibleWithinViewport(headerSection_xpath);
            footerVisible = browser.isVisibleWithinViewport(footerSection_xpath);
            console.log(headerVisible + ':' + footerVisible + ':' + numTry);
          }
          robot.keyTap('+', 'control');
          browser.pause(1000);
        } catch(e) {
          console.log(e);
        } 
      }   
      execSync(cmd_take_screenshot);
      robot.keyTap('0', 'control');
      browser.pause(1000);
    }

    if (scenario.isSuccessful()) {
      var html_tag;
      if (mySCREENSHOT == 1 || myMOVIE == 1) {
        execSync(cmd_rename_passed_screenshot);
        html_tag = '<img src="Passed_' + encodeURIComponent(scenario_png) + '"style="max-width: 100%; height: auto;" alt="Passed_' + scenario_png + '">'; 
      }
      if (myMOVIE == 1) {
        execSync(cmd_wait_recording_finish);
        execSync(cmd_rename_passed_recording);
        html_tag = '<video src="Passed_' + encodeURIComponent(scenario_mp4) + '"style="max-width: 100%; height: auto;" controls poster="Passed_' + scenario_png + '"/>Your browser does not support the video tag.</video>'; 
      }
      if (html_tag != null) {
        scenario.attach(html_tag, 'text/html');
      }
    } else {
      var html_tag;
      if (mySCREENSHOT == 1 || myMOVIE == 1) {
        execSync(cmd_rename_failed_screenshot);
        html_tag = '<img src="Failed_' + encodeURIComponent(scenario_png) + '"style="max-width: 100%; height: auto;" alt="Failed_' + scenario_png + '">'; 
      }
      if (myMOVIE == 1) {
        execSync(cmd_wait_recording_finish);
        execSync(cmd_rename_failed_recording);
        html_tag = '<video src="Failed_' + encodeURIComponent(scenario_mp4) + '"style="max-width: 100%; height: auto;" controls poster="Failed_' + scenario_png + '"/>Your browser does not support the video tag.</video>'; 
      }
      if (html_tag != null) {
        scenario.attach(html_tag, 'text/html');
      }
    }
    if (myRDPHOST && (myRDPHOST != 'localhost') && myRDPPORT) {
      try {
        execSync(cmd_stop_rdesktop);
      } catch(e) {}
      execSync('rm -f /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock');
    }
  },

  AfterFeature: function (event) {
    console.log(cmd_umount);
    execSync(cmd_umount);
  }
}