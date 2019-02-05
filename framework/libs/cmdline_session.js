// cmdline_session.js provides functions to run test in command line

const FrameworkPath = process.env.FrameworkPath || process.env.HOME + '/Projects/AutoBDD';
const fs = require('fs');
const execSync = require('child_process').execSync;

// remote command
const myPlatformIdSrc = process.env.HOME + '/Projects/xyPlatform/global/platform_id_rsa';
const myPlatformIdDes = process.env.HOME + '/.ssh/platform_id_rsa';
const cmd_copy_PlatformId = 'cp ' + myPlatformIdSrc + ' ' + myPlatformIdDes + ', chmod 0600 ' + myPlatformIdDes;

module.exports = {
  runCmd: function(command) {
    var result;
    var exitcode;
    var displayMsg = 'command: \n' + command + '\n\n';

    try {
        result = execSync(command).toString();
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }

    return {"output": result, "exitcode": exitcode}    
  },

  remoteRunCmd: function(command, sshLogin, sshPort, keyFile) {
    var mySshLogin = sshLogin || 'vagrant@localhost';
    var mySshPort = sshPort || 22;
    var myKeyFile = keyFile || process.env.HOME + '/.ssh/platform_id_rsa';
    var myCommand = 'ssh ' + mySshLogin + ' -p ' + mySshPort
                      + ' -o IdentityFile=' + myKeyFile
                      + ' -o StrictHostKeyChecking=no '
                      + command;
  
    var result;
    var exitcode;

    fs.existsSync(process.env.HOME + '/.ssh') || fs.mkdirSync(process.env.HOME + '/.ssh');
    fs.existsSync(myPlatformIdDes) || execSync(cmd_copy_PlatformId);

    try {
        result = execSync(myCommand).toString();
        exitcode = 0;
    } catch(e) {
        result = e.stdout.toString();
        exitcode = e.status;
    }
    return {"output": result, "exitcode": exitcode}    
  },

  runNewman: function(collection, environment) {
    var newman_command = 'newman run -e ' + collection
                         + ' '
                         + environment;
    console.log(newman_command);
    var newman_result = this.runCmd(newman_command);
    return newman_result;
  }
}
