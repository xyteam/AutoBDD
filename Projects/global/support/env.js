process.env.NODE_ENV = process.env.NODE_ENV || 'Tensorflow';
process.env.PLATFORM = process.env.PLATFORM || 'Linux';
process.env.BROWSER = process.env.BROWSER || 'CH';
process.env.DISPLAYSIZE = process.env.DISPLAYSIZE || '1920x1200';
process.env.ProjectFullPath = process.env.ProjectFullPath || process.env.HOME + '/Projects/AI-Exercise';
process.env.StepTimeoutInMS = process.env.StepTimeoutInMS || 60000;
process.env.REPORTDIR = process.env.REPORTDIR || '.';
process.env.MODULEPATH = process.env.MODULEPATH || '';

if (process.env.BROWSER == "IE11" && process.env.PLATFORM == 'Linux') {
  process.env.PLATFORM = 'Win7';
}

if (process.env.PLATFORM == 'Linux') {
  process.env.RDPHOST = process.env.RDPHOST || 'localhost';
} else {
  process.env.RDPHOST = process.env.RDPHOST || '10.0.2.2';
}

