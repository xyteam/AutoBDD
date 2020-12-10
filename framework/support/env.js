const execSync = require('child_process').execSync;
const fs = require('fs');
const cmd_get_screensize='xrandr --query | grep "screen connected" | cut -d\+ -f1 | cut -d" " -f3';
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
    switch (true) {
      case / 7[012]\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '2.46';
        break;
      case / 73\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '73.0.3683.68';
        break;
      case / 74\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '74.0.3729.6';
        break;
      case / 75\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '75.0.3770.140';
        break;
      case / 76\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '76.0.3809.126';
        break;
      case / 77\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '77.0.3865.40';
        break;
      case / 78\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '78.0.3904.105';
        break;
      case / 79\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '79.0.3945.36';
        break;
      case / 80\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '80.0.3987.106';
        break;
      case / 81\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '81.0.4044.138';
        break;
      case / 83\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '83.0.4103.39';
        break;
      case / 84\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '84.0.4147.30';
        break;
      case / 85\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '85.0.4183.87';
        break;
      case / 86\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '86.0.4240.22';
        break;
      case / 87\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '87.0.4280.88';
        break;  
      case / 88\./.test(process.env.chromeVersion):
        process.env.chromeDriverVersion = '88.0.4324.27';
        break;  
    }
    console.log('Chrome Driver ' + process.env.chromeDriverVersion)  
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
