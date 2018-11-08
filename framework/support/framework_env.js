process.env.FrameworkEnv = 'defined in framework_env.js';
process.env.PLATFORM = process.env.PLATFORM || 'Linux';
process.env.BROWSER = process.env.BROWSER || 'CH';
process.env.DISPLAYSIZE = process.env.DISPLAYSIZE || '1920x1200';
process.env.FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
process.env.StepTimeoutInMS = process.env.StepTimeoutInMS || 60000;
process.env.REPORTDIR = process.env.REPORTDIR || '.';
process.env.MODULEPATH = process.env.MODULEPATH || '';

if (process.env.BROWSER == "IE" && process.env.PLATFORM == 'Linux') {
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
}