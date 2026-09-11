const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const cmd_get_screensize='xrandr --query | grep "screen connected" | cut -d\+ -f1 | cut -d" " -f3';

// for framework
process.env.PLATFORM = process.env.PLATFORM || 'Linux';
process.env.BROWSER = process.env.BROWSER || 'CH';
process.env.DISPLAYSIZE = process.env.DISPLAYSIZE || execSync(cmd_get_screensize).toString('utf8').trim();
process.env.FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
process.env.StepTimeoutInMS = process.env.StepTimeoutInMS || 60000;
process.env.REPORTDIR = process.env.REPORTDIR || '.';
process.env.RELATIVEREPORTDIR = process.env.RELATIVEREPORTDIR || '.';
process.env.TestDir = process.env.TestDir || 'e2e-test';
process.env.TestModule = process.env.TestModule || '';
process.env.DownloadPathLocal = '/tmp/download_' + process.env.DISPLAY.substr(1);
process.env.TESSDATA_PREFIX = '/usr/share/tesseract-ocr/4.00/tessdata';
process.env.LastBrowserLog = '';
fs.existsSync(process.env.DownloadPathLocal) || fs.mkdirSync(process.env.DownloadPathLocal);

// for user test-project env
process.env.PROJECTBASE = process.env.PROJECTBASE || 'test-projects';
process.env.PROJECTNAME = process.env.PROJECTNAME || path.resolve().split(process.env.PROJECTBASE)[1].split('/')[1]
process.env.PROJECTRUNPATH = `${process.env.FrameworkPath}/${process.env.PROJECTBASE}/${process.env.PROJECTNAME}`;

// xvfb
process.env.XVFB_CHROME_PIXEL_OFFSET_X = process.env.XVFB_CHROME_PIXEL_OFFSET_X || 0;
process.env.XVFB_CHROME_PIXEL_OFFSET_Y = process.env.XVFB_CHROME_PIXEL_OFFSET_Y || 0;

// image
process.env.imageSimilarity = process.env.imageSimilarity || 0.8;
process.env.imageWaitTime = process.env.imageWaitTime || 1;

// auto-detect ReleaseString
if (process.env.PLATFORM == 'Linux') {
  process.env.ReleaseString = execSync('lsb_release -rs').toString('utf8').trim();
}

// auto-detect XVFB
if (process.env.PLATFORM == 'Linux' && process.env.DISPLAY.match(':\\d{2,}')) {
  process.env.XVFB = process.env.XVFB || 'XVFB';
}

// auto-detect CH version
if (process.env.PLATFORM == 'Linux') {
  if (!process.env.chromeVersion) {
    process.env.chromeVersion = execSync('google-chrome --version').toString('utf8').trim();
    console.log(process.env.chromeVersion);
  }
  if (!process.env.chromeDriverVersion) {
    // Dynamic detection: read the version from the actual chromedriver binary in
    // use (always matches the browser) instead of a stale hard-coded map that
    // only covered Chrome 70-97. Falls back to leaving it unset if no
    // chromedriver is reachable here.
    try {
      const drvBin = process.env.CHROMEDRIVER_PATH || 'chromedriver';
      const drvVer = execSync(`${drvBin} --version`).toString('utf8').match(/ChromeDriver\s+(\d+\.\d+\.\d+\.\d+)/);
      if (drvVer && drvVer[1]) process.env.chromeDriverVersion = drvVer[1];
    } catch (e) { /* chromedriver not reachable; leave chromeDriverVersion unset */ }
    console.log('Chrome Driver ' + (process.env.chromeDriverVersion || 'n/a'));
  }
}

// auto-correct platform
if (process.env.BROWSER == 'IE' && process.env.PLATFORM == 'Linux') {
  process.env.PLATFORM = 'Win10';
}

// if SSHPORT is defined it indicates a remote target, weset remote env vars
if (process.env.SSHPORT) {
  process.env.SSHHOST = process.env.SSHHOST || '10.0.2.2';
  process.env.SSHUSER = process.env.SSHUSER || 'IEUser';
  process.env.SSHPASS = process.env.SSHPASS || 'Passw0rd!';
  if (process.env.SSHHOST == '10.0.2.2') {
    process.env.RDPHOST = process.env.RDPHOST || 'localhost';
    process.env.RDPPORT = process.env.RDPPORT || process.env.SSHPORT.slice(0, -3) + '389';
    process.env.RDPUSER = process.env.RDPUSER || process.env.SSHUSER;
    process.env.RDPPASS = process.env.RDPPASS || process.env.SSHPASS;
    process.env.SELHOST = process.env.SELHOST || 'localhost';
    process.env.SELPORT = process.env.SELPORT || process.env.SSHPORT.slice(0, -3) + '444';
  }
}

// switches to control debugging messages
if (process.env.DebugAll == 1) {
  process.env.DebugFramework = 1;
  process.env.DebugTestProject = 1;
  process.env.DebugSelenium = 1;
  process.env.DebugCucumber = 1;
  process.env.DebugBrowser = 1;
}
