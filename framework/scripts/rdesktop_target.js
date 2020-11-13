#!/usr/bin/env node

// DISPLAY=:1 SSHPORT=21022 ./rdesktop_target.js --start &
// DISPLAY=:1 SSHPORT=21022 ./rdesktop_target.js --stop

var argv = require('minimist')(process.argv.slice(2));
const start = argv.start;
const stop = argv.stop;
process.env.DISPLAY = process.env.DISPLAY || ':1'
const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
require(FrameworkPath + '/framework/support/env.js');
const framework_libs = require(FrameworkPath + '/framework/libs/framework_libs');
const screen_session = require(FrameworkPath + '/framework/libs/screen_session');
const execSync = require('child_process').execSync;

if (start) {
  framework_libs.startSshTunnel();
  execSync('sleep 5');
  framework_libs.startRdesktop();
  try {
    var targetImagePath = FrameworkPath + '/framework/testimages/windows10_startButton.png';
    var imageSimilarity = 0.8;
    var imageWaitTime = 10;
    const result = JSON.parse(screen_session.screenWaitImage(targetImagePath, imageSimilarity, null, imageWaitTime));
    console.log(result.toString());
  } catch(e) {
  }
}

if (stop) {
  framework_libs.stopRdesktop();
  framework_libs.stopSshTunnel();
}