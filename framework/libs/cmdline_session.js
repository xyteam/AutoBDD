// cmdline_session.js provides functions to run test in command line

const assert = require('assert');
const fs = require('fs');
const execSync = require('child_process').execSync;
const spawn= require('child_process').spawn;

// remote command
const myPlatformIdDes = process.env.HOME + '/.ssh/platform_id_rsa';
const myPlatformKnownHosts = process.env.HOME + '/.ssh/known_hosts';

module.exports = {
  runCmd: function(command) {
    var result;
    var exitcode;
    try {
        result = execSync(command, {shell: '/bin/bash'}).toString();
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }
    const returnVal = {output: result, exitcode: exitcode};
    const returnString = JSON.stringify(returnVal);
    let stringArray = returnString.split('\r');
    let last5lines = stringArray.slice(Math.max(stringArray.length - 5, 0))
    console.log(last5lines);
    return returnString;
  },

  correctHostKey: function(targetHost) {
    fs.existsSync(process.env.HOME + '/.ssh') || fs.mkdirSync(process.env.HOME + '/.ssh');
    const cmd_correct_hostKey = `ssh-keygen -f "${myPlatformKnownHosts}" -R "${targetHost}"`;
    const runResult = this.runCmd(cmd_correct_hostKey);
    assert.equal(runResult.exitcode, 0, `cannot remove ${targetHost} from ${myPlatformKnownHosts}`);
  },

  remoteRunCmd: function(runCommand, sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const myRunCommand = ' "' + runCommand + '"';
    var mySshCommand;
    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = 'sshpass -e'
      + ' ssh ' + mySshLogin + ' -p ' + mySshPort
      + ' -o StrictHostKeyChecking=no'
      + myRunCommand;
    } else {
      mySshCommand = 'ssh ' + mySshLogin + ' -p ' + mySshPort
      + ' -o IdentityFile=' + myKeyFile
      + ' -o StrictHostKeyChecking=no'
      + myRunCommand;
    }
    var result;
    var exitcode;
    try {
        result = execSync(mySshCommand).toString();
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }
    const returnVal = {output: result, exitcode: exitcode};
    const returnString = JSON.stringify(returnVal);
    let stringArray = returnString.split('\r');
    let last5lines = stringArray.slice(Math.max(stringArray.length - 5, 0))
    console.log(last5lines);
    return returnString;
  },

  remoteConsole: function(sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    var mySshCommand, mySshArgs, mySshArgsArray;
    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = 'sshpass';
      mySshArgs = '-e ssh ' + mySshLogin + ' -p ' + mySshPort + ' -o StrictHostKeyChecking=no -tt';
    } else {
      mySshCommand = 'ssh';
      mySshArgs = mySshLogin + ' -p ' + mySshPort + ' -o IdentityFile=' + myKeyFile + ' -o StrictHostKeyChecking=no -tt';
    }
    mySshArgsArray = mySshArgs.split(' ');
    const consoleSpawnOption = {
      shell: true
    };
    const consoleProcess = spawn(mySshCommand, mySshArgsArray, consoleSpawnOption);
    const returnVal = consoleProcess;
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  runNewman: function(collection, environment) {
    var newman_command = 'newman run -e ' + collection
                         + ' '
                         + environment;
    console.log(newman_command);
    var newman_result = this.runCmd(newman_command);
    const returnVal = newman_result;
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  }
}

