process.env.PLATFORM = process.env.PLATFORM || 'Linux';
process.env.BROWSER = process.env.BROWSER || 'CH';
process.env.DISPLAYSIZE = process.env.DISPLAYSIZE || '1920x1200';
process.env.FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/runProjects/AutoBDD';
process.env.StepTimeoutInMS = process.env.StepTimeoutInMS || 60000;
process.env.REPORTDIR = process.env.REPORTDIR || '.';
process.env.MODULEPATH = process.env.MODULEPATH || '';

if (process.env.BROWSER == "IE" && process.env.PLATFORM == 'Linux') {
  process.env.PLATFORM = 'Win7';
}

if (process.env.PLATFORM == 'Linux') {
  process.env.RDPHOST = process.env.RDPHOST || 'localhost';
} else {
  process.env.RDPHOST = process.env.RDPHOST || '10.0.2.2';
}

