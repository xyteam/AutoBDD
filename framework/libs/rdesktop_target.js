#!/usr/bin/env node

// DISPLAY=:0 SSHPORT=21022 ./rdesktop_target.js --start &
// DISPLAY=:0 SSHPORT=21022 ./rdesktop_target.js --stop

var argv = require('minimist')(process.argv.slice(2));
const start = argv.start;
const stop = argv.stop;
process.env.DISPLAY = process.env.DISPLAY || ':0'
const frameworkPath = process.env.FrameworkPath;
require(frameworkPath + '/framework/support/env.js');
const framework_libs = require(frameworkPath + '/framework/libs/framework_libs');
const screen_session = require(frameworkPath + '/framework/libs/screen_session');
const execSync = require('child_process').execSync;

if (start) {
  framework_libs.startSshTunnel();
  execSync('sleep 5');
  framework_libs.startRdesktop();
  try {
    var targetImagePath = frameworkPath + '/framework/support/images/windows10_startButton.png';
    var imageSimilarity = 0.8;
    var imageWaitTime = 10;
    screen_session.screenWaitImage(targetImagePath, imageSimilarity, imageWaitTime);
    console.log('can see desktop');
  } catch(e) {
    console.log('cannot see desktop');
  }
}

if (stop) {
  framework_libs.stopRdesktop();
  framework_libs.stopSshTunnel();
}