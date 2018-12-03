#!/usr/bin/env node

// DISPLAY=:0 SSHPORT=21022 ./rdesktop_target.js --start &
// DISPLAY=:0 SSHPORT=21022 ./rdesktop_target.js --stop

var argv = require('minimist')(process.argv.slice(2));
const start = argv.start;
const stop = argv.stop;
process.env.DISPLAY = process.env.DISPLAY || ':0'
const frameworkPath = process.env.FrameworkPath;
require(frameworkPath + '/framework/support/framework_env.js');
const framework_libs = require(frameworkPath + '/framework/libs/framework_libs');
const execSync = require('child_process').execSync;

if (start) {
  framework_libs.startSshTunnel();
  execSync('sleep 5');
  framework_libs.startRdesktop();  
}

if (stop) {
  framework_libs.stopRdesktop();
  framework_libs.stopSshTunnel();
}