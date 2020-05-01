// cmdline_session.js provides functions to run test in command line

const assert = require('assert');
const fs = require('fs');
const execSync = require('child_process').execSync;
const spawn= require('child_process').spawn;
const stripAnsi = require('strip-ansi');

// remote command
const myPlatformIdDes = process.env.HOME + '/.ssh/platform_id_rsa';
const myPlatformKnownHosts = process.env.HOME + '/.ssh/known_hosts';

module.exports = {
  runCmd: function(command) {
    var result;
    var exitcode;
    try {
        let rawResult = execSync(command, {shell: '/bin/bash'}).toString();
        let stringArray = rawResult.split('\r');
        // reduce retracted result for display
        result = stringArray.slice(Math.max(stringArray.length - 10, 0)).join('\n');    
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }
    const returnVal = {output: result, exitcode: exitcode};
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  correctHostKey: function(targetHost) {
    fs.existsSync(process.env.HOME + '/.ssh') || fs.mkdirSync(process.env.HOME + '/.ssh');
    const cmd_correct_hostKey = `ssh-keygen -f "${myPlatformKnownHosts}" -R "${targetHost}"`;
    const runResult = this.runCmd(cmd_correct_hostKey);
    // assert.equal(runResult.exitcode, 0, `cannot remove ${targetHost} from ${myPlatformKnownHosts}`);
  },

  remoteRunCmd: function(runCommand, sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const myRunCommand = ' "' + runCommand + '"';

    const mySshHost = sshLogin.split('@')[1];
    this.correctHostKey(mySshHost);

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
      let rawResult = execSync(mySshCommand).toString();
      let stringArray = rawResult.split('\r');
      // reduce retracted result for display
      result = stringArray.slice(Math.max(stringArray.length - 10, 0)).join('\n');    
      exitcode = 0;
    } catch(e) {
      result = e.stdout.toString();
      exitcode = e.status;
    }
    const returnVal = {cmd: runCommand, output: result, exitcode: exitcode};
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  remoteConsole: function(sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';

    const mySshHost = sshLogin.split('@')[1];
    this.correctHostKey(mySshHost);

    var mySshCommand, mySshArgs, mySshArgsArray;
    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = 'sshpass';
      mySshArgs = '-e ssh ' + mySshLogin + ' -p ' + mySshPort + ' -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt';
    } else {
      mySshCommand = 'ssh';
      mySshArgs = mySshLogin + ' -p ' + mySshPort + ' -o IdentityFile=' + myKeyFile + ' -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt';
    }
    mySshArgsArray = mySshArgs.split(' ');
    const consoleSpawnOption = {
      shell: true
    };

    var myConsoleData = {stdout: '', stderr: ''};
    const myConsole = spawn(mySshCommand, mySshArgsArray, consoleSpawnOption);
    myConsole.stdout.on('data', function (data) {
      const myData = stripAnsi(data.toString());
      myConsoleData.stdout += myData;
      console.log('stdout: ' + myData);
    });
    myConsole.stderr.on('data', function (data) {
      const myData = stripAnsi(data.toString());
      myConsoleData.stdout += myData;
      console.log('stderr: ' + myData);
    });
    myConsole.on('close', function (code) {
      myConsoleData.stdout += `\n** SSH console closed with code: ${code}**\n`;
      console.log('child process exited with code ' + code);
    });

    return [myConsole, myConsoleData];
  }
}
