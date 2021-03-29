// cmdline_session.js provides functions to run test in command line

const fs = require('fs');
const execSync = require('child_process').execSync;
const spawn= require('child_process').spawn;
const stripAnsi = require('strip-ansi');

// remote command
const myPlatformKnownHosts = process.env.HOME + '/.ssh/known_hosts';

const sshAction = (sshCommand) => {
  var result;
  var exitcode;
  try {
    let rawResult = execSync(sshCommand).toString();
    let stringArray = rawResult.split('\r');
    // reduce retracted result for display
    result = stringArray.slice(Math.max(stringArray.length - 10, 0)).join('\n');    
    exitcode = 0;
  } catch(e) {
    result = e.stdout.toString();
    exitcode = e.status;
  }
  const returnVal = {cmd: sshCommand, output: result, exitcode: exitcode};
  const returnString = JSON.stringify(returnVal);
  return returnString;
}

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
      console.log(correct_hostKey_result);
    }

    return true;
  },

  remoteCopy: function(src, dst, sshPort, sshPass, sshKeyFile) {
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const mySshHost = src.includes('@') ? src.split('@')[1].split(':')[0] : dst.split('@')[1].split(':')[0];
    const mySshCommandWithoutCredential = `scp -P ${mySshPort} -o StrictHostKeyChecking=no -r ${src} ${dst}`;
    const mySshCommandwithKeyFile = `scp -P ${mySshPort} -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no -r ${src} ${dst}`;
    const mySshCommandwithPassword = `sshpass -e scp -P ${mySshPort} -o StrictHostKeyChecking=no -r ${src} ${dst}`;
    var mySshResult;

    this.correctHostKey(mySshHost, mySshPort);
    if (typeof(sshPass) == 'undefined' && typeof(sshKeyFile) == 'undefined') {
      mySshResult = sshAction(mySshCommandWithoutCredential);
    } else if (sshPass == 'SSH_KEYFILE') {
      mySshResult = sshAction(mySshCommandwithKeyFile);
    } else {
      process.env.SSHPASS = sshPass;
      mySshResult = sshAction(mySshCommandwithPassword);  
    }
    console.log(mySshResult);
    return mySshResult;
  },

  remoteRunCmd: function(runCommand, sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || 'vagrant@localhost';
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const myRunCommand = ' "' + runCommand + '"';
    const mySshHost = sshLogin.split('@')[1];
    const mySshCommandWithoutCredential =  `ssh ${mySshLogin} -p ${mySshPort}  -o StrictHostKeyChecking=no ${myRunCommand}`;
    const mySshCommandwithKeyFile = `ssh ${mySshLogin} -p ${mySshPort}  -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no ${myRunCommand}`;
    const mySshCommandwithPassword = `sshpass -e ssh ${mySshLogin} -p ${mySshPort} -o StrictHostKeyChecking=no ${myRunCommand}`;
    var mySshResult;
    this.correctHostKey(mySshHost, mySshPort);
    if (typeof(sshPass) == 'undefined' && typeof(sshKeyFile) == 'undefined') {
      mySshResult = sshAction(mySshCommandWithoutCredential);
    } else if (sshPass == 'SSH_KEYFILE') {
      mySshResult = sshAction(mySshCommandwithKeyFile);
    } else {
      process.env.SSHPASS = sshPass;
      mySshResult = sshAction(mySshCommandwithPassword);  
    }
    console.log(mySshResult);    
    return mySshResult;
  },

  remoteConsole: function(sshLogin, sshPort, sshPass, sshKeyFile) {
    const mySshLogin = sshLogin || `${process.env.USER}@localhost`;
    const mySshPort = sshPort || 22;
    const myKeyFile = sshKeyFile || process.env.HOME + '/.ssh/id_rsa';
    const mySshHost = sshLogin.split('@')[1];    
    const cmdWithoutCredential = {
      cmd: 'ssh',
      args: `${mySshLogin} -p ${mySshPort} -o ServerAliveInterval=30 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`
    }
    const cmdWithKeyFile = {
      cmd: 'ssh',
      args: `${mySshLogin} -p ${mySshPort} -o ServerAliveInterval=30 -o IdentityFile=${myKeyFile} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`
    }
    const cmdWithPassword = {
      cmd: 'sshpass',
      args: `-e ssh ${mySshLogin} -p ${mySshPort} -o ServerAliveInterval=30 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -tt`
    }
    const consoleSpawnOption = {
      shell: true
    };
    var myConsoleData = {stdout: '', stderr: ''};
    var myConsole;
    this.correctHostKey(mySshHost, mySshPort);
    if (typeof(sshPass) == 'undefined' && typeof(sshKeyFile) == 'undefined') {
      myConsole = spawn(cmdWithoutCredential.cmd, cmdWithoutCredential.args.split(' '), consoleSpawnOption);
    } else if (sshPass == 'SSH_KEYFILE') {
      myConsole = spawn(cmdWithKeyFile.cmd, cmdWithKeyFile.args.split(' '), consoleSpawnOption);
    } else {
      process.env.SSHPASS = sshPass;
      myConsole = spawn(cmdWithPassword.cmd, cmdWithPassword.args.split(' '), consoleSpawnOption);
    }

    if (myConsole.stderr) {
      myConsole.stdout.on('data', (data) => {
        const myData = stripAnsi(data.toString().replace(/\r\n/g, '\n'));
        myConsoleData.stdout += myData;
        // console.log('stdout: ' + myData);
      });
      myConsole.stderr.on('data', (data) => {
        const myData = stripAnsi(data.toString().replace(/\r\n/g, '\n'));
        myConsoleData.stderr += myData;
        // console.log('stderr: ' + myData);
      });
      myConsole.on('close', (code) => {
        myConsoleData.stdout += `\n** SSH console closed with code: ${code}**\n`;
        // console.log('child process exited with code ' + code);
      });
      return [myConsole, myConsoleData];  
    } else {
      return null;
    }
  }
}
