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

  correctHostKey: function(sshHost, sshPort) {
    const mySshHost = sshHost || 'localhost';
    const mySshPort = sshPort || `22`;
    fs.existsSync(process.env.HOME + '/.ssh') || fs.mkdirSync(process.env.HOME + '/.ssh');
    var needCorrection = true;
    const cmd_localHostKey = `ssh-keygen -H -F ${mySshHost}`;
    const localHostKey_result = JSON.parse(this.runCmd(cmd_localHostKey));
    if (localHostKey_result.output.includes(`Host ${mySshHost} found`)) {
      const localHostKey = localHostKey_result.output.split('\n')[1].split(' ')[2];
      const cmd_remoteHostKey = `ssh-keyscan -4 -p ${mySshPort} -H ${mySshHost}`;
      const remoteHostKey_result = JSON.parse(this.runCmd(cmd_remoteHostKey));
      if (remoteHostKey_result.output.includes(localHostKey)) {
        console.log(`${mySshHost} hostkey is recognized in known_hosts`);
        needCorrection = false;
      }
    }
    if (needCorrection) {
      console.log(`${mySshHost} hostkey needs to be replaced in known_hosts`);
      const cmd_correct_hostKey = `ssh-keygen -f "${myPlatformKnownHosts}" -R "${mySshHost}"`;
      const correct_hostKey_result = JSON.parse(this.runCmd(cmd_correct_hostKey));
      }
  },

  remoteCopy: function(src, dst, sshPort, sshPass, sshKeyFile) {
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const mySshHost = src.includes('@') ? src.split('@')[1].split(':')[0] : dst.split('@')[1].split(':')[0];
    this.correctHostKey(mySshHost, mySshPort);

    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = `sshpass -e scp -P ${mySshPort} -o StrictHostKeyChecking=no ${src} ${dst}`;
    } else if (typeof(sshKeyFile) != 'undefined') {
      mySshCommand = `scp -P ${mySshPort} -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no ${src} ${dst}`;
    } else {
      mySshCommand = `scp -P ${mySshPort} -o StrictHostKeyChecking=no ${src} ${dst}`
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
    const returnVal = {cmd: mySshCommand, output: result, exitcode: exitcode};
    const returnString = JSON.stringify(returnVal);
    console.log(returnString);
    return returnString;
  },

  remoteRunCmd: function(runCommand, sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const myRunCommand = ' "' + runCommand + '"';
    const mySshHost = sshLogin.split('@')[1];
    this.correctHostKey(mySshHost, mySshPort);

    var mySshCommand;
    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = `sshpass -e ssh ${mySshLogin} -p ${mySshPort} -o StrictHostKeyChecking=no ${myRunCommand}`;
    } else if (typeof(sshKeyFile) != 'undefined') {
      mySshCommand = `ssh ${mySshLogin} -p ${mySshPort}  -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no ${myRunCommand}`;
    } else {
      mySshCommand = `ssh ${mySshLogin} -p ${mySshPort}  -o StrictHostKeyChecking=no ${myRunCommand}`;
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
    this.correctHostKey(mySshHost, mySshPort);

    var mySshCommand, mySshArgs, mySshArgsArray;
    if (typeof(sshPass) != 'undefined') {
      process.env.SSHPASS = sshPass;
      mySshCommand = 'sshpass';
      mySshArgs = `-e ssh ${mySshLogin} -p ${mySshPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`;
    } else if (typeof(sshKeyFile) != 'undefined') {
      mySshCommand = 'ssh';
      mySshArgs = `${mySshLogin} -p ${mySshPort} -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`;
    } else {
      mySshCommand = 'ssh';
      mySshArgs = `${mySshLogin} -p ${mySshPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`;
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
