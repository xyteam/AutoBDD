const robot = require('robotjs');
const cmd = require('node-cmd');
const fs = require('fs');
const execSync = require('child_process').execSync;
const myWorld = require(process.env.FrameworkPath + '/global/support/world').World();
const myHOME = process.env.HOME;
const myDISPLAY = process.env.DISPLAY;
const myPLATFORM = process.env.PLATFORM;
const myBROWSER = process.env.BROWSER;
const myRDPHOST = process.env.RDPHOST;
const myRDPPORT = process.env.RDPPORT;
const mySSHPORT = process.env.SSHPORT;
const myDISPLAYSIZE = process.env.DISPLAYSIZE;
const myMOVIE = process.env.MOVIE;
const mySCREENSHOT = process.env.SCREENSHOT;
const myREPORTDIR = process.env.REPORTDIR;
const myMODULEPATH = process.env.MODULEPATH;
const myFrameworkPath = process.env.FrameworkPath;
const myDownloadPathLocal = '/tmp/download_' + myDISPLAY.substr(1); 
const cmd_copy_AutomationKey = 'cp ' + process.env.HOME + '/Projects/xyPlatform/global/platform_id_rsa ' + myHOME + '/.ssh/automation_id_rsa; chmod 0600 ' + myHOME + '/.ssh/automation_id_rsa';
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

    if (this.inDEBUGMODE == true) {
      console.log('already in browser debug mode');
    }

    // reset browser zoom
    robot.keyTap('0', 'control');
    browser.pause(1000);
  },

  BeforeScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    // console.log('BeforeScenario: ' + scenario.getName());
    var scenario_png = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.png';
    var scenario_mp4 = (myPLATFORM + '_' + myBROWSER + '_' + myMODULEPATH + '_' + scenario.getName()).replace(spaceChar_regex, '_').replace(specialChar_regex, '') + '.mp4';
    var cmd_start_recording = 'ffmpeg -y -s ' + myDISPLAYSIZE +' -f x11grab -an -nostdin -r 4 -i '
        + myDISPLAY
        + ' -filter:v "setpts=0.5*PTS" '
        + myREPORTDIR + '/Recording_' + scenario_mp4
        + ' 2> /dev/null &';

    // increase IE browser script execution time
    if (process.env.BROWSER == 'IE') {
      browser.timeouts('script', 60000);
    }

    if (myMOVIE == 1) {
      console.log(cmd_start_recording);
      cmd.run(cmd_start_recording);
    }
  },

  BeforeStep: function(event) {
    var step = event.getPayloadItem('step');
  },

  AfterStep: function(event) {
    var step = event.getPayloadItem('step');
  },

  // this AfterScenario has scenario info but without result. Use After below if you need result
  AfterScenario: function(event) {
    var scenario = event.getPayloadItem('scenario');
    // console.log('AfterScenario: ' + scenario.getName());'
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

    // Try to zoom the browser to take screenshot
    if (mySCREENSHOT == 1 || myMOVIE == 1) {  
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