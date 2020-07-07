const safeQuote = require('../libs/safequote');
const fs = require('fs');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const cmd = require('node-cmd');

// safe quote env vars - general and system
const spaceChar_regex = /\s+/g;
const invalidFileNameChar_regex = /[\:\;\,\(\)\/\'\"\.\&\%\<\>\#\-\=]/g;
const invalidEchoChar_regex = /[\(\)\<\>]/g;
const myHOME = safeQuote(process.env.HOME);
const myDISPLAY = safeQuote(process.env.DISPLAY);

// safe quote env vars - test related
const myPLATFORM = safeQuote(process.env.PLATFORM);
const myDISPLAYSIZE = safeQuote(process.env.DISPLAYSIZE);
const myMOVIE = safeQuote(process.env.MOVIE);
const mySCREENSHOT = safeQuote(process.env.SCREENSHOT);
const myREPORTDIR = safeQuote(process.env.REPORTDIR);
const myRELATIVEREPORTDIR = safeQuote(process.env.RELATIVEREPORTDIR);
const myMODULE = safeQuote(process.env.TestModule);
const myRUNREPORT = safeQuote(process.env.RUNREPORT);

// safe quote env vars - framework essential
const myBROWSER = safeQuote(process.env.BROWSER);
const mySSHHOST = safeQuote(process.env.SSHHOST);
const mySSHPORT = safeQuote(process.env.SSHPORT);
const mySSHUSER = safeQuote(process.env.SSHUSER);
const mySSHPASS = safeQuote(process.env.SSHPASS);
const mySELHOST = safeQuote(process.env.SELHOST);
const mySELPORT = safeQuote(process.env.SELPORT);
const myRDPHOST = safeQuote(process.env.RDPHOST);
const myRDPPORT = safeQuote(process.env.RDPPORT);
const myRDPUSER = safeQuote(process.env.RDPUSER) || mySSHUSER;
const myRDPPASS = safeQuote(process.env.RDPPASS) || mySSHPASS;
const myMOVIEFR = safeQuote(process.env.MOVIEFR) || '8';
const myMOVIERR = safeQuote(process.env.MOVIERR) || '1';

// safe quote env vars - framework deducted
const myDownloadPathLocal = safeQuote(process.env.DownloadPathLocal) || '/tmp/download_' + myDISPLAY.substr(1);

// there should be no process.env vars this line

// additional framework deducted
const mySSHConnString = mySSHUSER + '@' + mySSHHOST + ' -p ' + mySSHPORT;
const myRDPConnString = myRDPHOST + ':' + myRDPPORT + ' -u ' + myRDPUSER + ' -p ' + myRDPPASS;
const mySELPortMapString = ' -L' + mySELPORT + ':' + mySELHOST + ':' + 4444;
const myRDPPortMapString = ' -L' + myRDPPORT + ':' + myRDPHOST + ':' + 3389;
// TODO: In xyPlatform project we use vagrant to pre-install platform key to a cluster of test clients.
// Here we copy that key and allow AutoBDD to remote drive this cluster of test clients.
// It was working pretty well, should consider re-testing.
const myPlatformIdSrc = myHOME + '/Projects/xyPlatform/global/platform_id_rsa';
const myPlatformIdDes = myHOME + '/.ssh/platform_id_rsa';

// ssh_tunnel
const cmd_copy_PlatformId = 'cp ' + myPlatformIdSrc + ' ' + myPlatformIdDes + ', chmod 0600 ' + myPlatformIdDes;
const mySSHFSConnString = mySSHUSER + '@' + mySSHHOST + ':Downloads/ ' + myDownloadPathLocal + ' -p ' + mySSHPORT;
const cmd_check_ssh_tunnel = 'pgrep -f "ssh .*' + mySSHConnString + '"';
const cmd_start_ssh_tunnel = 'ssh -N '
                    + ' -o IdentityFile=' + myPlatformIdDes
                    + ' -o StrictHostKeyChecking=no '
                    + mySSHConnString + mySELPortMapString + myRDPPortMapString
                    + ' &';
const cmd_stop_ssh_tunnel = 'sleep 2; pkill -f "ssh .*' + mySSHConnString + '"';

// sshfs_mount
const cmd_check_sshfs_mount = 'pgrep -f "sshfs .*' + mySSHFSConnString + '"';
const cmd_start_sshfs_mount = 'sshfs -o uid=$(id -u),gid=$(id -g) -o nonempty'
                            + ' -o IdentityFile=' + myPlatformIdDes
                            + ' -o StrictHostKeyChecking=no '
                            + mySSHFSConnString;
const cmd_stop_sshfs_mount = 'if mountpoint -q ' + myDownloadPathLocal
                            + '; then fusermount -u ' + myDownloadPathLocal + '; fi';

// rdesktop
const cmd_check_rdesktop = 'pgrep -f "rdesktop .*' + myRDPHOST + ':' + myRDPPORT + '"';
const cmd_start_rdesktop = 'DISPLAY=' + myDISPLAY
                          + ' rdesktop -fa 16 -mE '
                          + myRDPConnString
                          + ' &';
const cmd_stop_rdesktop = 'pkill -f "rdesktop .*' + myRDPHOST + ':' + myRDPPORT + '"';
const cmd_create_rdesktop_lock = 'echo "' + cmd_start_rdesktop + '"'
                                + ' > /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock';
const cmd_remove_rdesktop_lock = 'rm -f /tmp/rdesktop.' + myRDPHOST + ':' + myRDPPORT + '.lock';

module.exports = {
  sleep: function (millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
  },
  
  // ssh_tunnel
  sshTunnelRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_ssh_tunnel).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startSshTunnel: function() {
    fs.existsSync(myHOME + '/.ssh') || fs.mkdirSync(myHOME + '/.ssh');
    fs.existsSync(myPlatformIdDes) || execSync(cmd_copy_PlatformId);
    if (!this.sshTunnelRunning()) {
      cmd.run(cmd_start_ssh_tunnel);
    } 
  },
  stopSshTunnel: function() {
    if (this.sshTunnelRunning()) {
      cmd.run(cmd_stop_ssh_tunnel);
    } 
  },

  // sshfs_mount
  sshFsRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_sshfs_mount).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startSshFs: function() {
    fs.existsSync(myDownloadPathLocal) || fs.mkdirSync(myDownloadPathLocal);
    if (!this.sshFsRunning()) {
      execSync(cmd_start_sshfs_mount);
    } 
  },
  stopSshFs: function() {
    if (this.sshFsRunning()) {
      execSync(cmd_stop_sshfs_mount);
    } 
  },

  // rdesktop
  rdesktopRunning: function() {
    // return true if running, false if not
    // filter empty element, total number of pid including self
    var pidCount = execSync(cmd_check_rdesktop).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startRdesktop: function() {
    if (!this.rdesktopRunning()) {
      execSync(cmd_create_rdesktop_lock);
      cmd.run(cmd_start_rdesktop);
    } 
  },
  stopRdesktop: function() {
    if (this.rdesktopRunning()) {
      cmd.run(cmd_stop_rdesktop);
      execSync(cmd_remove_rdesktop_lock);
    } 
  },

  // movie and screenshot
  convertScenarioNameToFileBase: function(scenarioName) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const fileBase = (myPLATFORM + '_' + myBROWSER + '_' + myMODULE + '_' + myScenarioName)
                      .replace(spaceChar_regex, '_')
                      .replace(invalidFileNameChar_regex, '');
    return fileBase;
  },
  convertScenarioStepNameToFileBase: function(scenarioName, stepIndex, stepName) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const myStepIndex = parseInt(stepIndex) || 0;
    const myStepName = safeQuote(stepName) || '';
    const fileBase = `${myScenarioName}.${myStepIndex}.${myStepName}`
                      .replace(spaceChar_regex, '_')
                      .replace(invalidFileNameChar_regex, '');
    return fileBase;
  },
  recordingRunning: function(scenarioName) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const scenario_mp4 = this.convertScenarioNameToFileBase(myScenarioName) + '.mp4';
    const recordingFile_fullPath = myREPORTDIR + '/Recording_' + scenario_mp4;
    const cmd_check_recording = `pgrep -f "ffmpeg .*${recordingFile_fullPath}"`;
    var pidCount = execSync(cmd_check_recording).toString().split('\n').filter(Boolean).length
    if (pidCount >= 2) {
      return true;
    } else {
      return false;
    }
  },
  startRecording: function(scenarioName) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const scenario_mp4 = this.convertScenarioNameToFileBase(myScenarioName) + '.mp4';
    const recordingFile_fullPath = myREPORTDIR + '/Recording_' + scenario_mp4;
    const cmd_start_recording = 'ffmpeg -y -s ' + myDISPLAYSIZE
        + ' -f x11grab -an -nostdin -r ' + myMOVIEFR
        + ' -i ' + myDISPLAY
        + ' -filter:v "setpts=' + myMOVIERR + '*PTS" '
        + recordingFile_fullPath
        + ' 2> /dev/null &';
    if (myScenarioName) {
      if (this.recordingRunning(myScenarioName)) this.stopRecording(myScenarioName);
      exec(cmd_start_recording);
    } else {
      console.log('startRecording: scenarioName can not be empty');
      return false;
    }
  },
  stopRecording: function(scenarioName) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const scenario_mp4 = this.convertScenarioNameToFileBase(myScenarioName) + '.mp4';
    const recordingFile_fullPath = myREPORTDIR + '/Recording_' + scenario_mp4;
    const cmd_stop_recording = `sleep 1; pkill -INT -f "ffmpeg .*${recordingFile_fullPath}"; sleep 1`;
    if (myScenarioName) {
      if (this.recordingRunning(myScenarioName))
        try {
          // this command will kill self and always return error, thus must put in a try block
          execSync(cmd_stop_recording);
        } catch(e) {
          console.log(e.stderr.toString());
        }
      } else {
        console.log('stopRecording: scenarioName can not be empty');
        return false;
      }
  },
  renameRecording: function(scenarioName, resultPrefix) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const myResultPrefix = safeQuote(resultPrefix);
    const scenario_mp4 = this.convertScenarioNameToFileBase(myScenarioName) + '.mp4';
    const recordingFile_fullPath = myREPORTDIR + '/Recording_' + scenario_mp4;
    const finalFile_fullPath = myREPORTDIR + '/' + myResultPrefix + '_' + scenario_mp4;
    const cmd_rename_movie = 'mv ' + recordingFile_fullPath + ' ' + finalFile_fullPath;
    while (this.recordingRunning(myScenarioName)) {
      browser.pause(1000);
    }
    try{
      execSync(cmd_rename_movie);
    } catch(e) {
      console.log(e);
      return false;
    }
  },
  takeScreenshot: function(scenarioName, resultPrefix, stepIndex, text, textColor, fontSize) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const myResultPrefix = safeQuote(resultPrefix) || '';
    const myStepIndex = parseInt(stepIndex) || 0;
    const myText = safeQuote(text) || '';
    const myTextColor = safeQuote(textColor) || 'green';
    const myFontSize = parseInt(fontSize) || 20;
    const scenario_png = `${this.convertScenarioNameToFileBase(myScenarioName)}.${myStepIndex}.png`;
    const cmd_take_screenshot = `import -silent -display ${myDISPLAY} -window root ${myREPORTDIR}/${myResultPrefix}_${scenario_png}`;
    if (myScenarioName) {
      var childProcess;
      if (myText && myText.length > 0 ) {
        childProcess = this.screenDisplayText(myText, myTextColor, myFontSize);
        const cmd_wait_display_start  = `while ! test -d /proc/${childProcess.pid}; do sleep 0.2; done; sleep 0.2`;
        execSync(cmd_wait_display_start);
      }
      exec(cmd_take_screenshot);
      if (myText && myText.length > 0 ) {
        const cmd_wait_display_stop  = `while test -d /proc/${childProcess.pid}; do sleep 0.2; if ps -p ${childProcess.pid} | grep defunct; then break; fi; done`;
        execSync(cmd_wait_display_stop);
      }
    } else {
      console.log('takeScreenshot: scenarioName can not be empty');
      return false;
    }
  },
  screenDisplayText: function(text, textColor, fontSize, textPosition) {
    const myText = safeQuote(text).replace(invalidEchoChar_regex, '');
    const myTextColor = safeQuote(textColor) || 'green';
    const myFontSize = parseInt(fontSize) || 20;
    const myTextPosition = parseInt(textPosition) || 6; // 9 positions (3 x 3): 0, 1, 2, 3, 4, 5, 6, 7, 8
    const cmd_aosd_cat_text = `echo ${myText} | aosd_cat -p ${myTextPosition} -n ${myFontSize} -R ${myTextColor} -B gray -b 120 -e 0 -f 0 -u 800 -o 0`;
    childProcess = exec(cmd_aosd_cat_text);
    return childProcess;
  },
  getImageMovieTags: function(scenarioName, resultPrefix, stepIndex) {
    const myScenarioName = safeQuote(scenarioName.replace(spaceChar_regex, '_').replace(invalidFileNameChar_regex, ''));
    const myResultPrefix = safeQuote(resultPrefix);
    const myStepIndex = parseInt(stepIndex) || 0;
    const scenario_base = this.convertScenarioNameToFileBase(myScenarioName);
    const scenario_mp4 = `${scenario_base}.mp4`;
    const scenario_png = `${scenario_base}.${myStepIndex}.png`;
    const image_tag = `<img src="${myRELATIVEREPORTDIR}/${myResultPrefix}_${encodeURIComponent(scenario_png)}" style="max-width: 100%; height: auto;" alt="${myResultPrefix}_${scenario_png}">`;
    const video_tag = `<video src="${myRELATIVEREPORTDIR}/${myResultPrefix}_${encodeURIComponent(scenario_mp4)}" style="max-width: 100%; height: auto;" controls autoplay/>Your browser does not support the video tag.</video>`; 
    return [image_tag, video_tag];
  },
  getRunlogTag: function() {
    const feature_runlog = myRUNREPORT;
    const runlog_tag = `<a href="${myRELATIVEREPORTDIR}/${feature_runlog}.html" style="max-width: 100%; height: auto;"/>${feature_runlog}</a>`;
    return runlog_tag;
  }
}
